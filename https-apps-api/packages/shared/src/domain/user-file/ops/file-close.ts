/* eslint-disable no-warning-comments */
import { UserFile } from '../..'
import { User } from '../../user/user.entity'
import { client, config, errors, queue } from '../../..'
import { BaseOperation } from '../../../utils/base-operation'
import { UidInput, UserCtx, UserOpsCtx } from '../../../types'
import { UserRepository } from '../../user/user.repository'
import { FILE_STATE_DX, FILE_STATE_PFDA } from '../user-file.types'
import { createSyncFilesStateTask } from '../../../queue'
import { findFileOrAssetWithUid } from '../user-file.helper'
import { SyncFilesStateOperation } from './sync-files-state'
import { FileUpdateOperation } from './file-update'


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
UidInput,
FileCloseOperationResponse | null
> {
  async run(input: UidInput): Promise<FileCloseOperationResponse | null> {
    const log = this.ctx.log
    const em = this.ctx.em
    const fileOrAsset = await findFileOrAssetWithUid(em, input.uid)
    if (!fileOrAsset) {
      log.error(`FileCloseOperation: File or asset with uid ${input.uid} not found`)
      throw new errors.FileNotFoundError(`File or asset with uid ${input.uid} not found`)
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

            const updatedFileOrAsset = await findFileOrAssetWithUid(em, input.uid)
            if (updatedFileOrAsset) {
              if (updatedFileOrAsset.state === FILE_STATE_DX.CLOSED) {
                log.info({
                  uid: input.uid,
                  state: updatedFileOrAsset.state,
                  size: updatedFileOrAsset.fileSize,
                }, 'FileCloseOperation: File is now closed after FileUpdateOperation')
              } else {
                log.info({
                  uid: input.uid,
                  state: updatedFileOrAsset.state,
                  size: updatedFileOrAsset.fileSize,
                }, 'FileCloseOperation: File is still not closed after FileUpdateOperation')
              }
            } else {
              log.info({
                uid: input.uid,
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
