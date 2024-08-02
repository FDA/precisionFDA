/* eslint-disable no-await-in-loop */
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { ClientRequestError } from '@shared/errors'
import { difference, groupBy } from 'ramda'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { UserOpsCtx } from '../../../types'
import { User } from '../../user/user.entity'
import { TASK_TYPE } from '../../../queue/task.input'
import { PlatformClient } from '../../../platform-client'
import { FileStatesParams } from '../../../platform-client/platform-client.params'
import {
  findFileOrAssetsWithDxid,
  findFileOrAssetWithUid,
  findUnclosedFilesOrAssets,
  getNodePath,
} from '../user-file.helper'
import { FILE_STATE_DX, IFileOrAsset } from '../user-file.types'
import { ChallengeUpdateCardImageUrlOperation } from '../../challenge/ops/update-challenge-card-image-url'
import { ChallengeRepository } from '../../challenge/challenge.repository'
import { removeRepeatable } from '../../../queue'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'

// Sync all files in non-closed states given a user context
//
class SyncFilesStateOperation extends WorkerBaseOperation<
UserOpsCtx,
void,
void> {
  platformClient: PlatformClient
  logger: any

  static getTaskType(): string {
    return TASK_TYPE.SYNC_FILES_STATE
  }

  static getBullJobId(userDxid: string): string {
    // We should at most have one queued task per user
    return `${TASK_TYPE.SYNC_FILES_STATE}.${userDxid}`
  }

  async syncFilesInProject(projectDxid: string, files: IFileOrAsset[], user: User): Promise<void> {
    const em = this.ctx.em
    const fileDxids = files.map(x => x.dxid)

    // This call can be particularly time-consuming, so log the times so we can later analyze
    this.logger.log('Starting platform findDataObjects call')

    const params: FileStatesParams = {
      fileDxids,
      projectDxid,
    }
    const response = await this.platformClient.fileStates(params)
    this.logger.log({ platformFilesCount: response.length },
      'End platform findDataObjects call',
    )

    // If there are files missing in the platform response it means
    // the file upload was abandoned and platform subsequently deleted it
    // in this case we remove the file record on our side
    const responseFileDxids = response.map(x => x.id)
    const abandonedFileDxids = difference(fileDxids, responseFileDxids)
    if (abandonedFileDxids.length > 0) {
      this.logger.log(
        { abandonedFileDxids },
        'Deleting files removed by platform',
      )
    }
    for (const dxid of abandonedFileDxids) {
      const fileOrAssets = await findFileOrAssetsWithDxid(this.ctx.em, dxid)
      if (!fileOrAssets) {
        this.logger.log({ dxid, fileOrAssets },
          'Error removing abandoned file. File with dxid not found',
        )
        continue
      }

      for (const file of fileOrAssets) {
        try {
          const filePath = await getNodePath(this.ctx.em, file as UserFile)
          const fileEvent = await createFileEvent(EVENT_TYPES.FILE_ABANDONED, file, filePath, user)
          em.persist(fileEvent)
          em.remove(file)
          await em.flush()

          this.logger.log({
            dxid: file.dxid,
            uid: file.uid,
          }, 'Removed abandoned file')
        } catch (err) {
          this.ctx.log.log({
            error: err,
            dxid,
          },
          'Error removing abandoned file')
        }
      }
    }

    // For every file info we receive from platform, update its state on pFDA
    for (const fileInfo of response) {
      const file = files.find(f => f.dxid === fileInfo.id)
      if (file && fileInfo.describe) {
        const fileOrAsset = await findFileOrAssetWithUid(this.ctx.em, file.uid)
        if (!fileOrAsset) {
          continue
        }

        this.logger.log({ fileDxid: fileOrAsset.dxid, fileInfo },
          `Updating file state ${fileInfo.describe.state} for file with uid ${fileOrAsset.uid}`,
        )
        fileOrAsset.fileSize = fileInfo.describe.size
        fileOrAsset.state = fileInfo.describe.state

        if (fileOrAsset.isCreatedByChallengeBot() && fileOrAsset.state === FILE_STATE_DX.CLOSED) {
          // Special case: If this closed file is used as a challenge card image
          // once they are uploaded and closed we need to update the cardImageUrl
          const challengeRepo = this.ctx.em.getRepository(Challenge) as ChallengeRepository
          const challenge = await challengeRepo.findOneWithCardImageUid(fileOrAsset.uid)
          if (challenge) {
            this.logger.log({ fileUid: fileOrAsset.uid },
              `File associated with challenge ${fileInfo.describe.state} for file with uid ${fileOrAsset.uid}`,
            )
            try {
              await new ChallengeUpdateCardImageUrlOperation(this.ctx).execute(challenge.id)
            } catch (error) {
              this.logger.error({ fileUid: fileOrAsset.uid, error },
                'Error invoking ChallengeUpdateCardImageUrlOperation',
              )
            }
          }
        }
      } else {
        this.logger.warn({ fileInfo },
          'Cannot find file or fileInfo.describe in response',
        )
      }
    }
    await this.ctx.em.flush()
  }

  async run(): Promise<void> {
    this.logger = this.ctx.log
    const em = this.ctx.em
    const dxuser = this.ctx.user.dxuser

    const user = await em.getRepository(User).findOne({ dxuser })
    if (!user) {
      this.logger.error(`User ${dxuser} not found`)
      return
    }

    if (user.isGuest()) {
      this.logger.error(`User ${dxuser} is a guest`)
      return
    }

    this.platformClient = new PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )
    let openFiles = await findUnclosedFilesOrAssets(em, user.id)

    this.logger.log({
      dxuser,
      numberOfOpenFiles: openFiles.length,
      openFiles: openFiles.map(f => f.dxid),
    }, `Starting files state sync for ${dxuser}`)

    try {
      // Group files based on project dxid, this is necessary to provide project hint to the
      // platform API call, which is VERY slow if this is not present
      const openFilesByProject = groupBy((file: IFileOrAsset) => file.project, openFiles)
      for (const projectDxid in openFilesByProject) {
        if (openFilesByProject.hasOwnProperty(projectDxid)) {
          const openFilesInProject = openFilesByProject[projectDxid]
          this.logger.log({
            projectDxid,
            openFiles: openFilesInProject.map(f => ({ name: f.name, dxid: f.dxid, uid: f.uid })),
          }, 'Syncing files state in project')

          await this.syncFilesInProject(projectDxid, openFilesInProject, user)
        }
      }
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.ctx.log.log({ error: err.props },
            'Received 401 from platform, removing sync task')
          await removeRepeatable(this.ctx.job)
        }
      }
      else {
        this.ctx.log.log({ error: err },
          'Unhandled error from platform, will retry later')
      }
      return
    }

    // If user has no more unclosed files, remove this task
    openFiles = await findUnclosedFilesOrAssets(em, user.id)
    if (openFiles.length === 0) {
      this.logger.log('Completed and all user files closed, removing repeatable job')
      await removeRepeatable(this.ctx.job)
    } else {
      this.logger.log({
        dxuser: user.dxuser,
        openFiles: openFiles.map(f => ({ name: f.name, dxid: f.dxid, uid: f.uid, createdAt: f.createdAt })),
      }, 'Completed with open files remaining',
      )
    }
  }
}

export { SyncFilesStateOperation }
