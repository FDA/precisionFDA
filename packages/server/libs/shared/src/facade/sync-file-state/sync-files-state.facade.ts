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
} from '@shared/domain/user-file/user-file.helper'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { ClientRequestError } from '@shared/errors'
import { Job } from 'bull'
import { removeRepeatable } from '@shared/queue'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { NodeHelper } from '@shared/domain/user-file/node.helper'

@Injectable()
export class SyncFilesStateFacade {
  MAX_FILES_PER_RUN = 100

  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly challengeService: ChallengeService,
    private readonly nodeHelper: NodeHelper,
    private readonly removeNodesFacade: RemoveNodesFacade,
  ) {}

  static getBullJobId(userDxid: string): string {
    // We should at most have one queued task per user
    return `${TASK_TYPE.SYNC_FILES_STATE}.${userDxid}`
  }

  async syncFiles(job: Job): Promise<void> {
    await this.userCtx.loadEntity()
    const dxuser = this.userCtx.dxuser

    const recentClosingFiles = await this.nodeHelper.findRecentClosingFilesAndAssets()
    const oldClosingFiles = await this.nodeHelper.findOldClosingFilesAndAssets()
    const oldOpenFiles = await this.nodeHelper.findOldOpenFilesAndAssets()

    if (recentClosingFiles.length > 0) {
      const recentClosingResult = await this.resolveRecentClosingFiles(
        recentClosingFiles,
        dxuser,
        job,
      )
      if (recentClosingResult === false) {
        return
      }
    }

    if (oldClosingFiles.length > 0) {
      await this.resolveOldClosingFiles(oldClosingFiles)
    }

    if (oldOpenFiles.length > 0) {
      await this.resolveOldOpenFiles(oldOpenFiles)
    }

    await this.removeTaskIfNoMoreUnclosedFiles(job)
  }

  private async resolveOldOpenFiles(oldOpenFiles: FileOrAsset[]): Promise<void> {
    this.logger.log(
      {
        numberOfOldOpenFiles: oldOpenFiles.length,
        oldOpenFiles: oldOpenFiles.map((f) => f.dxid),
      },
      'Resolving old open files',
    )

    for (const file of oldOpenFiles) {
      await this.removeNodesFacade.removeFile(file, true)
    }
    // TODO add notification PFDA-6613
  }

  private async resolveOldClosingFiles(oldClosingFiles: FileOrAsset[]): Promise<void> {
    this.logger.error(
      {
        numberOfOldClosingFiles: oldClosingFiles.length,
        oldClosingFiles: oldClosingFiles.map((f) => f.dxid),
      },
      'Resolving old closing files',
    )

    for (const file of oldClosingFiles) {
      await this.removeNodesFacade.removeFile(file, true)
    }
    // TODO add notification PFDA-6613
  }

  /**
   * Returns false if another processing should not continue, because something bad happened.
   *
   * @param recentClosingFiles
   * @param dxuser
   * @param job
   * @private
   */
  private async resolveRecentClosingFiles(
    recentClosingFiles: FileOrAsset[],
    dxuser: string,
    job: Job,
  ): Promise<boolean> {
    if (recentClosingFiles.length > this.MAX_FILES_PER_RUN) {
      this.logger.warn(
        `Too many closing files (${recentClosingFiles.length}) for ${dxuser}, processing only first ${this.MAX_FILES_PER_RUN}`,
      )
      recentClosingFiles = recentClosingFiles.slice(0, this.MAX_FILES_PER_RUN)
    }

    this.logger.log(
      {
        dxuser,
        numberOfOpenFiles: recentClosingFiles.length,
        openFiles: recentClosingFiles.map((f) => f.dxid),
      },
      `Starting files state sync for ${dxuser}`,
    )

    try {
      // Group files based on project dxid, this is necessary to provide project hint to the
      // platform API call, which is VERY slow if this is not present
      const openFilesByProject = groupBy((file: FileOrAsset) => file.project, recentClosingFiles)
      for (const projectDxid in openFilesByProject) {
        // biome-ignore lint/suspicious/noPrototypeBuiltins: Fix after migrating to ES2022 or later
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
      return false
    }
    return true
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
          try {
            await this.challengeService.updateCardImageUrl(fileOrAsset.uid)
          } catch (error) {
            this.logger.error(
              { fileUid: fileOrAsset.uid, error },
              'Error updating challenge card image URL',
            )
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
    const recentClosingFiles = await this.nodeHelper.findRecentClosingFilesAndAssets()
    if (recentClosingFiles.length === 0) {
      this.logger.log('Completed and all user files closed, removing repeatable job')
      await removeRepeatable(job)
    } else {
      this.logger.log(
        {
          dxuser: this.userCtx.dxuser,
          openFiles: recentClosingFiles.map((f) => ({
            name: f.name,
            dxid: f.dxid,
            uid: f.uid,
            createdAt: f.createdAt,
          })),
        },
        'Completed with closing files remaining',
      )
    }
  }
}
