import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { BulkDownloadFiles, FILE_STATE_DX, FILE_STI_TYPE, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { InvalidRequestError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { TimeUtils } from '@shared/utils/time.utils'

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
  async composeFilesForBulkDownload(fileIds: number[], folderId?: number): Promise<BulkDownloadFiles> {
    this.logger.log(`composing files for bulk download fileIds ${fileIds}, folderId ${folderId}`)
    const loadedUser = await this.userCtx.loadEntity()
    const nodes = await this.getAccessibleNodes(fileIds)
    const scope = nodes[0]?.scope ?? STATIC_SCOPE.PRIVATE

    const warnings = this.nodeHelper.getWarningsForUnclosedFiles(nodes)
    if (warnings) {
      await this.notificationService.createNotification({
        message: warnings,
        severity: SEVERITY.WARN,
        action: NOTIFICATION_ACTION.DOWNLOAD_FILES_WARNING,
        userId: this.userCtx.id,
        sessionId: this.userCtx.sessionId,
      })
    }
    let downloadableNodes = nodes.filter(
      (node): node is UserFile => node.stiType === FILE_STI_TYPE.USERFILE && node.state === FILE_STATE_DX.CLOSED,
    )
    downloadableNodes = this.nodeHelper.sanitizeNodeNames<UserFile>(downloadableNodes)
    downloadableNodes = this.nodeHelper.renameDuplicateFiles<UserFile>(downloadableNodes)
    const enclosingFolderPath = await this.nodeHelper.getFolderPath(folderId)

    return {
      files: await this.em.transactional(async tm => {
        const filePromises = downloadableNodes.map(async node => {
          return await this.processFile(tm, node, loadedUser, enclosingFolderPath)
        })
        return Promise.all(filePromises)
      }),
      scope,
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

  private async getAccessibleNodes(fileIDs: number[]): Promise<Node[]> {
    const nodes = await this.nodeService.loadNodes(fileIDs, {})

    const nodeIds = nodes.map(node => node.id)
    await this.validateAccessibleNodeIds(nodeIds)
    this.validateSingleScope(nodes)

    return nodes
  }

  private validateSingleScope(nodes: Node[]): void {
    const scopes = new Set(nodes.map(node => node.scope ?? STATIC_SCOPE.PRIVATE))
    if (scopes.size > 1) {
      throw new InvalidRequestError('Bulk download requires all selected items to be in the same scope')
    }
  }

  private async validateAccessibleNodeIds(nodeIds: number[]): Promise<void> {
    if (nodeIds.length === 0) {
      return
    }

    const accessibleNodes = await this.nodeRepo.findAccessible({ id: nodeIds })
    if (nodeIds.length !== accessibleNodes.length) {
      throw new PermissionError('You do not have permission to download all of these files')
    }
  }
}
