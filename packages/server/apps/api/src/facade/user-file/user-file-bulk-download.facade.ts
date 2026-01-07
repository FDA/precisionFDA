import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { TimeUtils } from '@shared/utils/time.utils'
import {
  BulkDownloadFiles,
  FILE_STI_TYPE,
  FileOrAsset,
} from '@shared/domain/user-file/user-file.types'
import { PermissionError } from '@shared/errors'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { PlatformClient } from '@shared/platform-client'
import { NodeService } from '@shared/domain/user-file/node.service'
import { EventHelper } from '@shared/domain/event/event.helper'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'

@Injectable()
export class UserFileBulkDownloadFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly userClient: PlatformClient,
    private readonly nodeHelper: NodeHelper,
    private readonly eventHelper: EventHelper,
    private readonly nodeRepo: NodeRepository,
    private readonly nodeService: NodeService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Returns an array of file paths and urls for bulk download.
   * @param fileIds
   * @param folderId
   */
  async composeFilesForBulkDownload(
    fileIds: number[],
    folderId?: number,
  ): Promise<BulkDownloadFiles> {
    this.logger.log(`composing files for bulk download fileIds ${fileIds}, folderId ${folderId}`)
    const loadedUser = await this.userCtx.loadEntity()
    let nodes = await this.getAccessibleNodes(fileIds)

    const warnings = this.nodeHelper.getWarningsForUnclosedFiles(nodes)
    if (warnings) {
      await this.notificationService.createNotification({
        message: warnings,
        severity: SEVERITY.WARN,
        action: NOTIFICATION_ACTION.DOWNLOAD_FILES_WARNING,
        userId: this.userCtx.id,
      })
    }
    nodes = nodes.filter((node) => node.state === 'closed')
    nodes = this.nodeHelper.sanitizeNodeNames(nodes)
    nodes = this.nodeHelper.renameDuplicateFiles(nodes)
    const enclosingFolderPath = await this.nodeHelper.getFolderPath(folderId)

    return {
      files: await this.em.transactional(async (tm) => {
        const filePromises = nodes
          .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE)
          .map(async (node) => {
            return await this.processFile(tm, node, loadedUser, enclosingFolderPath)
          })
        return Promise.all(filePromises)
      }),
      scope: nodes[0].scope,
    }
  }

  private async processFile(
    tm: SqlEntityManager,
    node: Asset | UserFile,
    loadedUser: User,
    enclosingFolderPath: string,
  ): Promise<{ url: string; path: string }> {
    const filePath = await this.nodeHelper.getNodePath(node)
    const fileDownloadLinkResponse = await this.userClient.fileDownloadLink({
      fileDxid: node.dxid,
      filename: node.name,
      project: node.project,
      duration: TimeUtils.daysToSeconds(1),
    })
    const fileEvent = await this.eventHelper.createFileEvent(
      EVENT_TYPES.FILE_BULK_DOWNLOAD,
      node as unknown as FileOrAsset,
      filePath,
      loadedUser,
    )
    tm.persist(fileEvent)
    return {
      url: fileDownloadLinkResponse.url,
      path:
        enclosingFolderPath && filePath.startsWith(enclosingFolderPath)
          ? filePath.slice(enclosingFolderPath.length)
          : filePath,
    }
  }

  private async getAccessibleNodes(fileIDs: number[]): Promise<(Asset | UserFile)[]> {
    const nodes = (await this.nodeService.loadNodes(fileIDs, {})) as (Asset | UserFile)[]
    const idsToCheck = nodes
      .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE)
      .map((node) => node.id)
    const accessibleNodes = await this.nodeRepo.findAccessible({ id: idsToCheck })
    if (idsToCheck.length != accessibleNodes.length) {
      throw new PermissionError('You do not have permission to download all of these files')
    }
    return nodes
  }
}
