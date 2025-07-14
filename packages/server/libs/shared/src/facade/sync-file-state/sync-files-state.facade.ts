import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Injectable, Logger } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { TASK_TYPE } from '@shared/queue/task.input'
import { FILE_STATE_DX, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { FileStatesParams } from '@shared/platform-client/platform-client.params'
import { difference, groupBy } from 'ramda'
import {
  findFileOrAssetsWithDxid,
  findFileOrAssetWithUid,
  findUnclosedFilesOrAssets,
} from '@shared/domain/user-file/user-file.helper'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeUpdateCardImageUrlOperation } from '@shared/domain/challenge/ops/update-challenge-card-image-url'
import { ClientRequestError } from '@shared/errors'
import { Job } from 'bull'
import { removeRepeatable } from '@shared/queue'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserOpsCtx } from '@shared/types'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UserRepository } from '@shared/domain/user/user.repository'

@Injectable()
export class SyncFilesStateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly userRepo: UserRepository,
    private readonly challengeRepo: ChallengeRepository,
    private readonly removeNodesFacade: RemoveNodesFacade,
  ) {}

  static getBullJobId(userDxid: string): string {
    // We should at most have one queued task per user
    return `${TASK_TYPE.SYNC_FILES_STATE}.${userDxid}`
  }

  async syncFiles(job: Job): Promise<void> {
    await this.userCtx.loadEntity()
    const dxuser = this.userCtx.dxuser

    const user = await this.userRepo.findOne({ dxuser })
    if (!user) {
      this.logger.error(`User ${dxuser} not found`)
      return
    }

    let openFiles = await findUnclosedFilesOrAssets(this.em, user.id)

    this.logger.log(
      {
        dxuser,
        numberOfOpenFiles: openFiles.length,
        openFiles: openFiles.map((f) => f.dxid),
      },
      `Starting files state sync for ${dxuser}`,
    )

    try {
      // Group files based on project dxid, this is necessary to provide project hint to the
      // platform API call, which is VERY slow if this is not present
      const openFilesByProject = groupBy((file: FileOrAsset) => file.project, openFiles)
      for (const projectDxid in openFilesByProject) {
        if (openFilesByProject.hasOwnProperty(projectDxid)) {
          const openFilesInProject = openFilesByProject[projectDxid]
          this.logger.log(
            {
              projectDxid,
              openFiles: openFilesInProject.map((f) => ({
                name: f.name,
                dxid: f.dxid,
                uid: f.uid,
              })),
            },
            'Syncing files state in project',
          )

          await this.syncFilesInProject(projectDxid, openFilesInProject)
        }
      }
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
          await removeRepeatable(job)
        }
      } else {
        this.logger.log({ error: err }, 'Unhandled error from platform, will retry later')
      }
      return
    }

    await this.removeTaskIfNoMoreUnclosedFiles(job)
  }

  private async syncFilesInProject(projectDxid: string, files: FileOrAsset[]): Promise<void> {
    const fileDxids = files.map((x) => x.dxid)

    // This call can be particularly time-consuming, so log the times so we can later analyze
    this.logger.log('Starting platform findDataObjects call')

    const params: FileStatesParams = {
      fileDxids,
      projectDxid,
    }
    const response = await this.platformClient.fileStates(params)
    this.logger.log({ platformFilesCount: response.length }, 'End platform findDataObjects call')

    // If there are files missing in the platform response it means
    // the file upload was abandoned and platform subsequently deleted it
    // in this case we remove the file record on our side
    const responseFileDxids = response.map((x) => x.id)
    const abandonedFileDxids = difference(fileDxids, responseFileDxids)
    if (abandonedFileDxids.length > 0) {
      this.logger.log({ abandonedFileDxids }, 'Deleting files removed by platform')
    }
    for (const dxid of abandonedFileDxids) {
      const fileOrAssets = await findFileOrAssetsWithDxid(this.em, dxid)
      if (!fileOrAssets) {
        this.logger.log(
          { dxid, fileOrAssets },
          'Error removing abandoned file. File with dxid not found',
        )
        continue
      }

      for (const file of fileOrAssets) {
        await this.removeNodesFacade.removeFile(file)
      }
    }

    // For every file info we receive from platform, update its state on pFDA
    for (const fileInfo of response) {
      const file = files.find((f) => f.dxid === fileInfo.id)
      if (file && fileInfo.describe) {
        const fileOrAsset = await findFileOrAssetWithUid(this.em, file.uid)
        if (!fileOrAsset) {
          continue
        }

        this.logger.log(
          { fileDxid: fileOrAsset.dxid, fileInfo },
          `Updating file state ${fileInfo.describe.state} for file with uid ${fileOrAsset.uid}`,
        )
        fileOrAsset.fileSize = fileInfo.describe.size
        fileOrAsset.state = fileInfo.describe.state

        if (fileOrAsset.isCreatedByChallengeBot() && fileOrAsset.state === FILE_STATE_DX.CLOSED) {
          // Special case: If this closed file is used as a challenge card image
          // once they are uploaded and closed we need to update the cardImageUrl
          const challenge = await this.challengeRepo.findOneWithCardImageUid(fileOrAsset.uid)
          if (challenge) {
            this.logger.log(
              { fileUid: fileOrAsset.uid },
              `File associated with challenge ${fileInfo.describe.state} for file with uid ${fileOrAsset.uid}`,
            )
            try {
              const opsCtx: UserOpsCtx = {
                log: this.logger,
                user: this.userCtx,
                em: this.em,
              }
              await new ChallengeUpdateCardImageUrlOperation(opsCtx).execute(challenge.id)
            } catch (error) {
              this.logger.error(
                { fileUid: fileOrAsset.uid, error },
                'Error invoking ChallengeUpdateCardImageUrlOperation',
              )
            }
          }
        }
      } else {
        this.logger.warn({ fileInfo }, 'Cannot find file or fileInfo.describe in response')
      }
    }
    await this.em.flush()
  }

  private async removeTaskIfNoMoreUnclosedFiles(job: Job): Promise<void> {
    // If user has no more unclosed files, remove this task
    const openFiles = await findUnclosedFilesOrAssets(this.em, this.userCtx.id)
    if (openFiles.length === 0) {
      this.logger.log('Completed and all user files closed, removing repeatable job')
      await removeRepeatable(job)
    } else {
      this.logger.log(
        {
          dxuser: this.userCtx.dxuser,
          openFiles: openFiles.map((f) => ({
            name: f.name,
            dxid: f.dxid,
            uid: f.uid,
            createdAt: f.createdAt,
          })),
        },
        'Completed with open files remaining',
      )
    }
  }
}
