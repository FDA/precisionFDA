/* eslint-disable no-warning-comments */
import { UserFile } from '../..'
import { User } from '../../user/user.entity'
import { client, config, errors, queue } from '../../..'
import { BaseOperation } from '../../../utils/base-operation'
import { UserCtx, UserOpsCtx } from '../../../types'
import { UserRepository } from '../../user/user.repository'
import { FILE_STATE_DX, FILE_STATE_PFDA } from '../user-file.types'
import { createSyncFilesStateTask } from '../../../queue'
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

// FileCloseOperation closes an open File or Asset
class FileCloseOperation extends BaseOperation<
UserOpsCtx,
CloseFileInput,
FileCloseOperationResponse | null
> {
  async run(input: CloseFileInput): Promise<FileCloseOperationResponse | null> {
    console.log(`AAA input: ${JSON.stringify(input)}`)
    const log = this.ctx.log
    const em = this.ctx.em
    const fileOrAsset = await findFileOrAssetWithUid(em, input.id)
    if (!fileOrAsset) {
      log.error(`FileCloseOperation: File or asset with uid ${input.id} not found`)
      throw new errors.FileNotFoundError(`File or asset with uid ${input.id} not found`)
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
        log.info({ fileDxid: fileOrAsset.dxid }, 'FileCloseOperation: Challenge bot file')
      } else {
        log.error(
          { fileDxid: fileOrAsset.dxid },
          `FileCloseOperation: User ${user.dxuser} does not have access to file ${input.uid}`,
        )
        throw new errors.PermissionError(`User ${user.dxuser} does not have access to file ${input.uid}`)
      }
      accessToken = config.platform.challengeBotAccessToken
    }

    if (fileOrAsset.state === FILE_STATE_DX.OPEN) {
      log.info({ fileDxid: fileOrAsset.dxid }, 'FileCloseOperation: File is in open state. Syncing from platform')

      const userClient = new client.PlatformClient(accessToken, this.ctx.log)
      const response = await userClient.fileClose({
        fileDxid: fileOrAsset.dxid,
      })
      log.info({ response }, 'FileCloseOperation: Received response from platform')

      fileOrAsset.state = FILE_STATE_DX.CLOSING
      await em.flush()

      const syncFilesOpDxuser = isChallengeBotFile ? config.platform.challengeBotUser : this.ctx.user.dxuser

      const bullJobId = SyncFilesStateOperation.getBullJobId(syncFilesOpDxuser)
      log.info({ bullJobId }, 'FileCloseOperation: Looking for existing sync task in queue')
      let bullJob = await queue.findRepeatable(bullJobId)
      if (bullJob && queue.utils.isJobOrphaned(bullJob)) {
        log.info('FileCloseOperation: Existing SyncFilesStateTask is orphaned, removing it')
        await queue.removeRepeatableJob(bullJob, queue.getMainQueue())
        bullJob = undefined
      }

      if (!bullJob) {
        if (isChallengeBotFile) {
          log.info('FileCloseOperation: Creating SyncFilesStateTask for challenge bot user')
          const challengeBotUser = await userRepo.findChallengeBotUser()
          const challengeBotCtx: UserCtx = {
            id: challengeBotUser.id,
            dxuser: challengeBotUser.dxuser,
            accessToken: User.getChallengeBotToken(),
          }
          createSyncFilesStateTask(challengeBotCtx)
        } else {
          log.info(`FileCloseOperation: Creating SyncFilesStateTask for user ${this.ctx.user.dxuser}`)
          createSyncFilesStateTask(this.ctx.user)
        }
      } else {
        log.info({ bullJob }, 'FileCloseOperation: Not creating SyncFilesStateTask because one already exists')
      }

      if (!isChallengeBotFile) {
        // TODO: This is to be removed in favour of async notifications once those are ready
        //
        // Quite often a file is in closed state after a short delay, and to improve our My Home upload UI
        // we do this update so that the frontend has the correct state immediately after refresh
        // This is not for challege bot files because we still want file sync to invoke it's
        // card image update logic
        const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
        const refreshFileState = async () => {
          await delay(500).then(async () => {
            log.info('FileCloseOperation: Invoking FileUpdateOperation after delay to close file')
            await new FileUpdateOperation(this.ctx).execute({ uid: fileOrAsset.uid })

            const updatedFileOrAsset = await findFileOrAssetWithUid(em, input.id)
            if (updatedFileOrAsset) {
              if (updatedFileOrAsset.state === FILE_STATE_DX.CLOSED) {
                log.info({
                  uid: input.id,
                  state: updatedFileOrAsset.state,
                  size: updatedFileOrAsset.fileSize,
                }, 'FileCloseOperation: File is now closed after FileUpdateOperation')
              } else {
                if (input.forceWaitForClose) {
                  // TODO this is just temporary solution for PFDA-4599, before
                  //  we implement async closing solution
                  let numberOfRetries = 0
                  let updateFinished = false
                  while (numberOfRetries < 11 && !updateFinished) {
                    await delay(500).then(async () => {
                      numberOfRetries++
                      log.info({
                        uid: input.id,
                        state: updatedFileOrAsset.state,
                        size: updatedFileOrAsset.fileSize,
                      }, `FileCloseOperation: File is still not closed after FileUpdateOperation, retrying with attempt no ${numberOfRetries}`)
                      await new FileUpdateOperation(this.ctx).execute({uid: fileOrAsset.uid})
                      const updatedNode = await findFileOrAssetWithUid(em, input.id)
                      if (updatedNode?.state === FILE_STATE_DX.CLOSED) {
                        log.info({
                          uid: input.id,
                          state: updatedFileOrAsset.state,
                          size: updatedFileOrAsset.fileSize,
                        }, `FileCloseOperation: File was not closed after FileUpdateOperation, retrying finished`)
                        updateFinished = true
                      }
                    })
                  }
                } else {
                  log.info({
                    uid: input.id,
                    state: updatedFileOrAsset.state,
                    size: updatedFileOrAsset.fileSize,
                  }, 'FileCloseOperation: File is still not closed after FileUpdateOperation')
                }
              }
            } else {
              log.info({
                uid: input.id,
              }, 'FileCloseOperation: File no longer exists after FileUpdateOperation?? What?!')
            }
          })
        }
        await refreshFileState()
      }

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
