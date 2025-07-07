import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Injectable, Logger } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { TASK_TYPE } from '@shared/queue/task.input'
import { FILE_STATE_DX, IFileOrAsset } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { FileStatesParams } from '@shared/platform-client/platform-client.params'
import { difference, groupBy } from 'ramda'
import {
  findFileOrAssetsWithDxid,
  findFileOrAssetWithUid, findUnclosedFilesOrAssets,
  getNodePath,
} from '@shared/domain/user-file/user-file.helper'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { createFileEvent, EVENT_TYPES } from '@shared/domain/event/event.helper'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import {
  ChallengeUpdateCardImageUrlOperation
} from '@shared/domain/challenge/ops/update-challenge-card-image-url'
import { ClientRequestError } from '@shared/errors'
import { removeRepeatable } from '@shared/queue'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Injectable()
export class SyncFilesStateService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly platformClient: PlatformClient,
    private readonly user: UserContext,
  ) {}

  static getBullJobId(userDxid: string): string {
    // We should at most have one queued task per user
    return `${TASK_TYPE.SYNC_FILES_STATE}.${userDxid}`
  }

  private async syncFilesInProject(projectDxid: string, files: IFileOrAsset[], user: User): Promise<void> {
    const em = this.em
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
        try {
          const filePath = await getNodePath(this.em, file as UserFile)
          const fileEvent = await createFileEvent(EVENT_TYPES.FILE_ABANDONED, file, filePath, user)
          em.persist(fileEvent)
          em.remove(file)
          await em.flush()

          this.logger.log(
            {
              dxid: file.dxid,
              uid: file.uid,
            },
            'Removed abandoned file',
          )
        } catch (err) {
          this.logger.log(
            {
              error: err,
              dxid,
            },
            'Error removing abandoned file',
          )
        }
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
          const challengeRepo = this.em.getRepository(Challenge) as ChallengeRepository
          const challenge = await challengeRepo.findOneWithCardImageUid(fileOrAsset.uid)
          if (challenge) {
            this.logger.log(
              { fileUid: fileOrAsset.uid },
              `File associated with challenge ${fileInfo.describe.state} for file with uid ${fileOrAsset.uid}`,
            )
            try {
              await new ChallengeUpdateCardImageUrlOperation(this.ctx).execute(challenge.id)
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

  // TODO rename
  async run(): Promise<void> {
    await this.user.loadEntity()
    const dxuser = this.user.dxuser

    const user = await this.em.getRepository(User).findOne({ dxuser })
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
      const openFilesByProject = groupBy((file: IFileOrAsset) => file.project, openFiles)
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

          await this.syncFilesInProject(projectDxid, openFilesInProject, user)
        }
      }
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
          await removeRepeatable(this.ctx.job)
        }
      } else {
        this.logger.log({ error: err }, 'Unhandled error from platform, will retry later')
      }
      return
    }

    // If user has no more unclosed files, remove this task
    openFiles = await findUnclosedFilesOrAssets(this.em, user.id)
    if (openFiles.length === 0) {
      this.logger.log('Completed and all user files closed, removing repeatable job')
      await removeRepeatable(this.ctx.job)
    } else {
      this.logger.log(
        {
          dxuser: user.dxuser,
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
