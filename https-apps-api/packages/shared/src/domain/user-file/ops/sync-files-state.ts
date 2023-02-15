/* eslint-disable no-await-in-loop */
import { groupBy } from 'ramda'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { UserOpsCtx } from '../../../types'
import { client, errors, queue } from '../../..'
import { User } from '../../user/user.entity'
import { TASK_TYPE } from '../../../queue/task.input'
import { PlatformClient } from '../../../platform-client'
import { FileStatesParams } from '../../../platform-client/platform-client.params'
import { findFileOrAssetWithUid, findUnclosedFilesOrAssets } from '../user-file.helper'
import { FILE_STATE_DX, IFileOrAsset } from '../user-file.types'
import { ChallengeUpdateCardImageUrlOperation } from '../../challenge/ops/update-challenge-card-image-url'
import { ChallengeRepository } from '../../challenge/challenge.repository'
import { Challenge } from '../../challenge'
import { removeRepeatable } from '../../../queue'


// Sync all files in non-closed states given a user context
//
class SyncFilesStateOperation extends WorkerBaseOperation<
UserOpsCtx,
void,
void> {
  platformClient: PlatformClient
  log: any

  static getBullJobId(userDxid: string): string {
    // We should at most have one queued task per user
    return `${TASK_TYPE.SYNC_FILES_STATE}.${userDxid}`
  }

  async syncFilesInProject(projectDxid: string, files: IFileOrAsset[]): Promise<void> {
    const fileDxids = files.map(x => x.dxid)

    // This call can be particularly time-consuming, so log the times so we can later analyze
    this.log.info('SyncFilesStateOperation: Starting platform findDataObjects call')

    const params: FileStatesParams = {
      fileDxids,
      projectDxid,
    }
    const response = await this.platformClient.fileStates(params)
    this.log.info({ platformFilesCount: response.length },
      'SyncFilesStateOperation: End platform findDataObjects call',
    )

    for (const fileInfo of response) {
      const file = files.find(f => f.dxid === fileInfo.id)
      if (file && fileInfo.describe) {
        const fileOrAsset = await findFileOrAssetWithUid(this.ctx.em, file.uid)
        if (!fileOrAsset) {
          continue
        }

        this.log.info({ fileDxid: fileOrAsset.dxid, fileInfo },
          `SyncFilesStateOperation: Updating file state ${fileInfo.describe.state} for file ${fileOrAsset.name}`,
        )
        fileOrAsset.fileSize = fileInfo.describe.size
        fileOrAsset.state = fileInfo.describe.state

        if (fileOrAsset.isCreatedByChallengeBot() && fileOrAsset.state === FILE_STATE_DX.CLOSED) {
          // Special case: If this closed file is used as a challenge card image
          // once they are uploaded and closed we need to update the cardImageUrl
          const challengeRepo = this.ctx.em.getRepository(Challenge) as ChallengeRepository
          const challenge = await challengeRepo.findOneWithCardImageUid(fileOrAsset.uid)
          if (challenge) {
            this.log.info({ fileUid: fileOrAsset.uid },
              `SyncFilesStateOperation: File associated with challenge ${fileInfo.describe.state} for file ${fileOrAsset.name}`,
            )
            try {
              new ChallengeUpdateCardImageUrlOperation(this.ctx).execute(challenge.id)
            } catch (error) {
              this.log.error({ fileUid: fileOrAsset.uid, error },
                'SyncFilesStateOperation: Error invoking ChallengeUpdateCardImageUrlOperation',
              )
            }
          }
        }
      } else {
        this.log.warn({ fileInfo },
          'SyncFilesStateOperation: Cannot find file or fileInfo.describe in response',
        )
      }
    }
    await this.ctx.em.flush()
  }

  async run(): Promise<void> {
    this.log = this.ctx.log
    const em = this.ctx.em
    const dxuser = this.ctx.user.dxuser

    const user = await em.getRepository(User).findOne({ dxuser })
    if (!user) {
      this.log.error(`SyncFilesStateOperation: User ${dxuser} not found`)
      return
    }

    if (user.isGuest()) {
      this.log.error(`SyncFilesStateOperation: User ${dxuser} is a guest`)
      return
    }

    this.platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    let openFiles = await findUnclosedFilesOrAssets(em, user.id)

    this.log.info({
      dxuser,
      numberOfOpenFiles: openFiles.length,
      openFiles: openFiles.map(f => f.dxid),
    }, `SyncFilesStateOperation: Starting files state sync for ${dxuser}`)

    try {
      // Group files based on project dxid, this is necessary to provide project hint to the
      // platform API call, which is VERY slow if this is not present
      const openFilesByProject = groupBy((file: IFileOrAsset) => file.project, openFiles)
      for (const projectDxid in openFilesByProject) {
        if (openFilesByProject.hasOwnProperty(projectDxid)) {
          const openFilesInProject = openFilesByProject[projectDxid]
          this.log.info({
            projectDxid,
            openFiles: openFilesInProject.map(f => ({ name: f.name, dxid: f.dxid, uid: f.uid })),
          }, 'SyncFilesStateOperation: Syncing files state in project')

          await this.syncFilesInProject(projectDxid, openFilesInProject)
        }
      }
    } catch (err) {
      if (err instanceof errors.ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.ctx.log.info({ error: err.props },
            'SyncFilesStateOperation: Received 401 from platform, removing sync task')
          await removeRepeatable(this.ctx.job)
        }
      }
      else {
        this.ctx.log.info({ error: err },
          'SyncFilesStateOperation: Unhandled error from platform, will retry later')
      }
      return
    }

    // If user has no more unclosed files, remove this task
    openFiles = await findUnclosedFilesOrAssets(em, user.id)
    if (openFiles.length === 0) {
      this.log.info('SyncFilesStateOperation: Completed and all user files closed, removing repeatable job')
      await queue.removeRepeatable(this.ctx.job)
    } else {
      this.log.info({
        openFiles: openFiles.map(f => ({ name: f.name, dxid: f.dxid, uid: f.uid })),
      }, 'SyncFilesStateOperation: Completed with open files remaining',
      )
    }
  }
}

export {
  SyncFilesStateOperation,
}
