/* eslint-disable no-warning-comments */
import { EntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FileNotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { isJobOrphaned } from '@shared/queue/queue.utils'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { User } from '../../user/user.entity'
import { BaseOperation } from '@shared/utils/base-operation'
import { UserCtx, UserOpsCtx } from '../../../types'
import { UserRepository } from '../../user/user.repository'
import { FILE_STATE_DX, FILE_STATE_PFDA, IFileOrAsset } from '../user-file.types'
import { createSyncFilesStateTask, findRepeatable, getMainQueue, removeRepeatableJob } from '../../../queue'
import { findFileOrAssetWithUid } from '../user-file.helper'
import { SyncFilesStateOperation } from './sync-files-state'
import { FileUpdateOperation } from './file-update'
import { CloseFileInput } from '../user-file.input'

const responseMap = {
  [FILE_STATE_DX.ABANDONED]: 'Cannot close file because it has been abandoned',
  [FILE_STATE_DX.CLOSING]: 'File is already in closing state',
  [FILE_STATE_DX.CLOSED]: 'File is already closed',
  [FILE_STATE_PFDA.REMOVING]: 'Cannot close file because it is being removed',
}

type FileCloseOperationResponse = {
  message?: string
}

const getChallengeBotCtx = async(userRepo: UserRepository): Promise<UserCtx> => {
  const challengeBotUser = await userRepo.findChallengeBotUser()
  const challengeBotCtx: UserCtx = {
    id: challengeBotUser.id,
    dxuser: challengeBotUser.dxuser,
    accessToken: User.getChallengeBotToken(),
  }
  return challengeBotCtx
}

const createFileCreateEvent = async (userFile: IFileOrAsset, user: User, em: EntityManager) => {
  const fileEvent = await createFileEvent(
    EVENT_TYPES.FILE_CREATED,
    userFile,
    userFile.name,
    user,
  )
  em.persist(fileEvent)
  await em.flush()
}

// FileCloseOperation closes an open File or Asset
class FileCloseOperation extends BaseOperation<
  UserOpsCtx,
  CloseFileInput,
  FileCloseOperationResponse | null
> {
  async run(input: CloseFileInput): Promise<FileCloseOperationResponse | null> {
    const log = this.ctx.log
    const em = this.ctx.em
    const fileOrAsset = await findFileOrAssetWithUid(em, input.id)
    if (!fileOrAsset) {
      log.error(`FileCloseOperation: File or asset with uid ${input.id} not found`)
      throw new FileNotFoundError(`File or asset with uid ${input.id} not found`)
    }

    const userRepo = em.getRepository(User) as UserRepository
    const user = await userRepo.findDxuser(this.ctx.user.dxuser)

    let isChallengeBotFile = false
    let accessToken = this.ctx.user.accessToken

    if (user.id !== fileOrAsset.user.getEntity().id && fileOrAsset.isFile) {
      // Challenge resources are always files, see create_challenge_resource in api_controller.rb
      const file = fileOrAsset as UserFile
      await em.populate(file, ['challengeResources'])
      isChallengeBotFile = file.isCreatedByChallengeBot() && (await user.isSiteAdmin() || await user.isChallengeAdmin())
      if (isChallengeBotFile) {
        log.verbose({ fileDxid: fileOrAsset.dxid }, 'FileCloseOperation: Challenge bot file')
      } else {
        log.error(
          { fileDxid: fileOrAsset.dxid },
          `FileCloseOperation: User ${user.dxuser} does not have access to file ${input.id}`,
        )
        throw new PermissionError(`User ${user.dxuser} does not have access to file ${input.id}`)
      }
      accessToken = config.platform.challengeBotAccessToken
    }

    if (fileOrAsset.state === FILE_STATE_DX.OPEN) {
      log.verbose({ fileDxid: fileOrAsset.dxid }, 'FileCloseOperation: File is in open state. Syncing from platform')

      const userClient = new PlatformClient(accessToken, this.ctx.log)
      const response = await userClient.fileClose({
        fileDxid: fileOrAsset.dxid,
      })
      log.verbose({ response }, 'FileCloseOperation: Received response from platform')

      fileOrAsset.state = FILE_STATE_DX.CLOSING
      await em.flush()

      const syncFilesOpDxuser = isChallengeBotFile ? config.platform.challengeBotUser : this.ctx.user.dxuser

      const bullJobId = SyncFilesStateOperation.getBullJobId(syncFilesOpDxuser)
      log.verbose({ bullJobId }, 'FileCloseOperation: Looking for existing sync task in queue')
      let bullJob = await findRepeatable(bullJobId)
      if (bullJob && isJobOrphaned(bullJob)) {
        log.verbose('FileCloseOperation: Existing SyncFilesStateTask is orphaned, removing it')
        await removeRepeatableJob(bullJob, getMainQueue())
        bullJob = undefined
      }

      if (!bullJob) {
        if (isChallengeBotFile) {
          log.verbose('FileCloseOperation: Creating SyncFilesStateTask for challenge bot user')
          const challengeBotUser = await userRepo.findChallengeBotUser()
          const challengeBotCtx: UserCtx = {
            id: challengeBotUser.id,
            dxuser: challengeBotUser.dxuser,
            accessToken: User.getChallengeBotToken(),
          }
          createSyncFilesStateTask(challengeBotCtx)
        } else {
          log.verbose(`FileCloseOperation: Creating SyncFilesStateTask for user ${this.ctx.user.dxuser}`)
          createSyncFilesStateTask(this.ctx.user)
        }
      } else {
        log.verbose({ bullJob }, 'FileCloseOperation: Not creating SyncFilesStateTask because one already exists')
      }

      const challengeBotCtx = await getChallengeBotCtx(userRepo)
      const ctxForUpdate: UserOpsCtx = isChallengeBotFile ? { user: challengeBotCtx, log, em } : this.ctx
      // TODO: This is to be removed in favour of async notifications once those are ready
      //
      // Quite often a file is in closed state after a short delay, and to improve our My Home upload UI
      // we do this update so that the frontend has the correct state immediately after refresh
      // This is not for challenge bot files because we still want file sync to invoke it's
      // card image update logic
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
      const refreshFileState = async () => {
        await delay(500).then(async () => {
          log.verbose('FileCloseOperation: Invoking FileUpdateOperation after delay to close file')
          await new FileUpdateOperation(ctxForUpdate).execute({ uid: fileOrAsset.uid })

          const updatedFileOrAsset = await findFileOrAssetWithUid(em, input.id)
          if (updatedFileOrAsset) {
            if (updatedFileOrAsset.state === FILE_STATE_DX.CLOSED) {
              log.verbose({
                uid: input.id,
                state: updatedFileOrAsset.state,
                size: updatedFileOrAsset.fileSize,
              }, 'FileCloseOperation: File is now closed after FileUpdateOperation')
              await createFileCreateEvent(updatedFileOrAsset, user, em)
            } else {
              if (input.forceWaitForClose) {
                // TODO this is just temporary solution for PFDA-4599, before
                //  we implement async closing solution
                let numberOfRetries = 0
                let updateFinished = false
                while (numberOfRetries < 11 && !updateFinished) {
                  await delay(1000).then(async () => {
                    numberOfRetries++
                    log.verbose({
                      uid: input.id,
                      state: updatedFileOrAsset.state,
                      size: updatedFileOrAsset.fileSize,
                    }, `FileCloseOperation: File is still not closed after FileUpdateOperation, retrying with attempt no ${numberOfRetries}`)
                    await new FileUpdateOperation(ctxForUpdate).execute({ uid: fileOrAsset.uid })
                    const updatedNode = await findFileOrAssetWithUid(em, input.id)
                    if (updatedNode?.state === FILE_STATE_DX.CLOSED) {
                      log.verbose({
                        uid: input.id,
                        state: updatedFileOrAsset.state,
                        size: updatedFileOrAsset.fileSize,
                      }, 'FileCloseOperation: File was not closed after FileUpdateOperation, retrying finished')
                      updateFinished = true
                      await createFileCreateEvent(updatedFileOrAsset, user, em)
                    }
                  })
                }
              } else {
                log.verbose({
                  uid: input.id,
                  state: updatedFileOrAsset.state,
                  size: updatedFileOrAsset.fileSize,
                }, 'FileCloseOperation: File is still not closed after FileUpdateOperation')
              }
            }
          } else {
            log.verbose({
              uid: input.id,
            }, 'FileCloseOperation: File no longer exists after FileUpdateOperation?? What?!')
          }
        })
      }
      await refreshFileState()

      return {}
    }

    if (fileOrAsset.state in responseMap) {
      return {
        // @ts-ignore
        message: responseMap[fileOrAsset.state],
      }
    }

    return null
  }
}

export {
  FileCloseOperation,
}
