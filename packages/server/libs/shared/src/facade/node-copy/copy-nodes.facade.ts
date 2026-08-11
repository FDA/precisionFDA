import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EVENT_TYPES, Event } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { NodeTagging } from '@shared/domain/tagging/node-tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { NodeCopyResultDTO } from '@shared/domain/user-file/dto/node-copy-result.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { FILE_STI_TYPE, FileOrAsset, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { EntityScope } from '@shared/types/common'

/**
 * Facade for copying nodes (files and folders) between different scopes. If user specifies
 * folder only by its ID and not it's nodes they are automatically loaded recursively.
 */
@Injectable()
export class CopyNodesFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly nodeHelper: NodeHelper,
    private readonly eventHelper: EventHelper,
    private readonly nodeService: NodeService,
    private readonly notificationService: NotificationService,
    private readonly spaceEventService: SpaceEventService,
  ) {}

  async copyNodes(
    requestedIds: number[],
    targetScope: EntityScope,
    targetFolderId?: number,
  ): Promise<NodeCopyResultDTO[]> {
    this.logger.log(
      `Copying nodes with ids: [${requestedIds.join(', ')}] to folderId: ${targetFolderId} within scope: ${targetScope}`,
    )

    const user = await this.user.loadEntity()

    const nodes = await this.nodeService.loadNodes(requestedIds, {})

    // Folders carry no project - resolve the source project from file nodes
    // and validate that all of them belong to the same one.
    const fileNodes = nodes.filter(node => node.isFile || node.isAsset)
    const sourceProject = fileNodes[0]?.project
    const allSameProject = fileNodes.every(node => node.project === sourceProject)
    if (!allSameProject) {
      throw new InvalidStateError('All nodes to be copied must belong to the same source project.')
    }

    // 'editable' also enforces a CAN_EDIT role in a target space, mirroring the copy/validate pre-check
    const destinationProject = await user.getDestinationProjectId(targetScope, 'editable')
    if (!destinationProject) {
      this.logger.error(`Failed to resolve destination project for scope ${targetScope}`)
      await this.processErrorNotification('You do not have permission to copy files to this scope.')
      throw new PermissionError('You do not have permission to copy files to this scope.')
    }
    // Parent folders must be processed before their children so that
    // sourceFoldersMap contains the mapped destination folder by the time a
    // child is copied - otherwise the child silently falls back to the scope
    // root and the folder hierarchy is lost. Do not rely on the input order:
    // sort explicitly by parent-child dependencies.
    const nodesToProcess = this.sortParentsFirst(nodes)
    const copyableNodes: Node[] = []
    // The challenge bot copies challenge submitters' files into the challenge space
    // on their behalf. The bot never owns those files - access is granted by a
    // temporary platform-level VIEW permission on the submitter's project, so the
    // DB accessibility check must be skipped for the bot identity. The platform
    // projectClone call remains the effective permission gatekeeper.
    const skipAccessibilityCheck = user.isChallengeBot()
    for (const sourceNode of nodesToProcess) {
      if (await this.validateNode(sourceNode, skipAccessibilityCheck)) {
        copyableNodes.push(sourceNode)
      }
    }

    const fileDxIds = copyableNodes
      .filter((node): node is FileOrAsset => node.isFile || node.isAsset)
      .map(node => node.dxid)

    if (fileDxIds.length > 0) {
      try {
        await this.platformClient.projectClone(sourceProject, destinationProject, fileDxIds)
      } catch (error: unknown) {
        // permissions are most likely missing - log and notify user
        this.logger.error('An error occurred while copying nodes', error as Error)
        await this.processErrorNotification()
        throw error
      }
    }

    let newlyCreatedFilesCount = 0
    let newlyCreatedFoldersCount = 0
    const nodesExistingInTarget: Node[] = []
    const copyResults: NodeCopyResultDTO[] = []

    const sourceFoldersMap = new Map<number, Node>()

    try {
      await this.em.transactional(async tem => {
        for (const sourceNode of copyableNodes) {
          const targetParentFolderId = this.getTargetParentFolderId(sourceNode, sourceFoldersMap, targetFolderId)
          const existingNode = await this.getExistingNode(
            sourceNode,
            targetScope,
            user,
            destinationProject,
            targetParentFolderId,
          )
          if (existingNode) {
            this.logger.log(`Node with uid: ${sourceNode.uid} already exists in target. Skipping.`)

            if (existingNode.stiType === FILE_STI_TYPE.FOLDER) {
              sourceFoldersMap.set(sourceNode.id, existingNode)
            }

            nodesExistingInTarget.push(existingNode)
            copyResults.push({
              sourceNodeId: sourceNode.id,
              targetNodeId: existingNode.id,
              copied: false,
            })
            continue
          }

          const newlyCreatedNode = await this.createNewNode(
            sourceNode,
            user,
            destinationProject,
            targetScope,
            sourceFoldersMap,
            targetFolderId,
          )

          tem.persist(newlyCreatedNode)
          await tem.flush()

          await this.possiblyProcessArchiveEntries(sourceNode, newlyCreatedNode)
          await this.copyProperties(sourceNode, newlyCreatedNode)
          await this.copyTags(sourceNode as UserFile | Asset | Folder, newlyCreatedNode)
          await this.processEvents(newlyCreatedNode, user, sourceNode, sourceFoldersMap)
          copyResults.push({
            sourceNodeId: sourceNode.id,
            targetNodeId: newlyCreatedNode.id,
            copied: true,
          })

          if (newlyCreatedNode.isFile) {
            newlyCreatedFilesCount++
          } else {
            newlyCreatedFoldersCount++
          }
        }
      })
      await this.processInfoNotification(nodesExistingInTarget.length, newlyCreatedFilesCount, newlyCreatedFoldersCount)
      return copyResults
    } catch (error: unknown) {
      // collect all dxids of cloned files and rollback
      const dxids = fileDxIds
      // filter out nodes that existed in target to avoid deleting user's existing files
      const dxidsToRollback = dxids.filter(
        dxid => !nodesExistingInTarget.find(node => (node as FileOrAsset).dxid === dxid),
      )

      const chunkSize = 100
      for (let i = 0; i < dxidsToRollback.length; i += chunkSize) {
        const batch = dxidsToRollback.slice(i, i + chunkSize)
        await this.platformClient.containerRemoveObjects(destinationProject, batch)
      }

      this.logger.error('An error occurred while copying nodes', error as Error)
      await this.processErrorNotification()
      throw error
    }
  }

  private async validateNode(node: Node, skipAccessibilityCheck = false): Promise<boolean> {
    const result = skipAccessibilityCheck ? node : await this.nodeService.getAccessibleEntityById(node.id)
    if (!result) {
      throw new NotFoundError(`Node with id ${node.id} is not accessible or does not exist`)
    }

    await this.nodeService.validateProtectedSpaces('copy', this.user.id, node)
    if ((result.isFile || result.isAsset) && result.state !== 'closed') {
      this.logger.warn(`Skipping node with id ${node.id} because it is not in the closed state.`)
      return false
    }
    if (result.isFolder && result.state === 'removing') {
      throw new InvalidStateError(`Folder in 'removing' state cannot be copied.`)
    }
    return true
  }

  private async processEvents(
    newlyCreatedNode: UserFile | Asset | Folder,
    user: User,
    sourceNode: Node,
    sourceFoldersMap: Map<number, Node>,
  ): Promise<void> {
    if (newlyCreatedNode.isInSpace() && (newlyCreatedNode.isFile || newlyCreatedNode.isAsset)) {
      const spaceEvent = await this.spaceEventService.createSpaceEvent({
        activityType: newlyCreatedNode.isAsset
          ? SPACE_EVENT_ACTIVITY_TYPE.asset_added
          : SPACE_EVENT_ACTIVITY_TYPE.file_added,
        entity: {
          type: newlyCreatedNode.isAsset ? 'asset' : 'userFile',
          value: newlyCreatedNode,
        },
        spaceId: newlyCreatedNode.getSpaceId(),
        userId: user.id,
      })
      await this.spaceEventService.sendNotificationForEvent(spaceEvent)
    }

    await this.createAndPersistNodeCopyEvent(sourceNode, newlyCreatedNode, user, sourceFoldersMap)
  }

  private async copyTags(
    sourceNode: UserFile | Asset | Folder,
    newlyCreatedNode: UserFile | Asset | Folder,
  ): Promise<void> {
    await this.em.populate(sourceNode, ['taggings'])

    for (const sourceTagging of sourceNode.taggings) {
      const newTagging = new NodeTagging()

      newTagging.tagId = sourceTagging.tagId
      newTagging.taggerId = this.user.id
      newTagging.context = sourceTagging.context
      newTagging.taggerType = sourceTagging.taggerType
      newTagging.taggableType = sourceTagging.taggableType

      newlyCreatedNode.taggings.add(newTagging)
    }
  }

  private async copyProperties(sourceNode: Node, newlyCreatedNode: UserFile | Asset | Folder): Promise<void> {
    await this.em.populate(sourceNode, ['properties'])
    for (const property of sourceNode.properties) {
      const newProperty = new NodeProperty()
      newProperty.node = Reference.create(newlyCreatedNode)
      newProperty.targetId = newlyCreatedNode.id
      newProperty.targetType = 'node'
      newProperty.propertyName = property.propertyName
      newProperty.propertyValue = property.propertyValue
      newlyCreatedNode.properties.add(newProperty)
    }
  }

  private async possiblyProcessArchiveEntries(
    sourceNode: Node,
    newlyCreatedNode: UserFile | Asset | Folder,
  ): Promise<void> {
    if (sourceNode.isAsset) {
      const sourceAsset = sourceNode as Asset
      await this.em.populate(sourceAsset, ['archiveEntries'])
      if (sourceAsset.archiveEntries?.length > 0) {
        for (const archiveEntry of sourceAsset.archiveEntries) {
          const copiedArchiveEntry = new ArchiveEntry()
          copiedArchiveEntry.name = archiveEntry.name
          copiedArchiveEntry.path = archiveEntry.path
          ;(newlyCreatedNode as Asset).archiveEntries.add(copiedArchiveEntry)
        }
      }
    }
  }

  private async processErrorNotification(
    message = 'An error occurred while copying your files. Please try again later.',
  ): Promise<void> {
    await this.notificationService.createNotification({
      message,
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.NODES_COPIED,
      userId: this.user.id,
      sessionId: this.user.sessionId,
    })
  }

  private async processInfoNotification(
    existingNodesCount: number,
    newlyCreatedFilesCount: number,
    newlyCreatedFoldersCount: number,
  ): Promise<void> {
    await this.notificationService.createNotification({
      message: this.getNotificationMessage(existingNodesCount, newlyCreatedFilesCount, newlyCreatedFoldersCount),
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.NODES_COPIED,
      userId: this.user.id,
      sessionId: this.user.sessionId,
    })
  }

  private async createNewNode(
    sourceNode: Node,
    user: User,
    destinationProject: `project-${string}`,
    targetScope: 'private' | 'public' | `space-${number}`,
    sourceFoldersMap: Map<number, Node>,
    targetFolderId?: number,
  ): Promise<UserFile | Asset | Folder> {
    const newlyCreatedNode = this.createCorrectType(sourceNode, user)
    newlyCreatedNode.name = sourceNode.name
    newlyCreatedNode.project = destinationProject
    newlyCreatedNode.user = Reference.create(user)
    newlyCreatedNode.scope = targetScope
    newlyCreatedNode.parentId = sourceNode.id
    newlyCreatedNode.stiType = sourceNode.stiType

    if (sourceNode.isFile || sourceNode.isAsset) {
      const newlyCreatedNodeAsFile = newlyCreatedNode as FileOrAsset
      newlyCreatedNode.description = sourceNode.description
      newlyCreatedNodeAsFile.fileSize = sourceNode.fileSize
      newlyCreatedNodeAsFile.dxid = (sourceNode as FileOrAsset).dxid
      newlyCreatedNodeAsFile.uid = await this.nodeHelper.generateUid(newlyCreatedNodeAsFile.dxid)
      newlyCreatedNode.state = sourceNode.state
    }
    this.possiblySetParentFolder(sourceNode, newlyCreatedNode, targetScope, sourceFoldersMap, targetFolderId)
    return newlyCreatedNode
  }

  private async createAndPersistNodeCopyEvent(
    sourceNode: Node,
    newlyCreatedNode: Node,
    user: User,
    sourceFoldersMap: Map<number, Node>,
  ): Promise<void> {
    let event: Event
    if (sourceNode.stiType === FILE_STI_TYPE.FOLDER) {
      event = await this.eventHelper.createFolderEvent(
        EVENT_TYPES.FOLDER_CREATED,
        newlyCreatedNode as Folder,
        await this.nodeHelper.getNodePath(newlyCreatedNode),
        user,
      )
      sourceFoldersMap.set(sourceNode.id, newlyCreatedNode)
    }
    if ([FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET].includes(sourceNode.stiType)) {
      event = await this.eventHelper.createFileCopyEvent(
        sourceNode as FileOrAsset,
        await this.nodeHelper.getNodePath(sourceNode),
        newlyCreatedNode as FileOrAsset,
        await this.nodeHelper.getNodePath(newlyCreatedNode),
        user,
      )
    }
    this.em.persist(event)
    await this.em.flush()
  }

  private createCorrectType(sourceNode: Node, user: User): Asset | UserFile | Folder {
    let newlyCreatedNode: Asset | UserFile | Folder
    switch (sourceNode.stiType) {
      case FILE_STI_TYPE.ASSET:
        newlyCreatedNode = new Asset(user)
        newlyCreatedNode.parentType = PARENT_TYPE.ASSET
        break
      case FILE_STI_TYPE.USERFILE:
        newlyCreatedNode = new UserFile(user)
        newlyCreatedNode.parentType = PARENT_TYPE.NODE
        break
      case FILE_STI_TYPE.FOLDER:
        newlyCreatedNode = new Folder(user)
        newlyCreatedNode.parentType = PARENT_TYPE.NODE
        break
    }
    return newlyCreatedNode
  }

  private getNotificationMessage(
    existingNodesCount: number,
    newlyCreatedFilesCount: number,
    newlyCreatedFoldersCount: number,
  ): string {
    const parts: string[] = []
    if (newlyCreatedFilesCount > 0) {
      parts.push(getSuccessMessage(newlyCreatedFilesCount, newlyCreatedFoldersCount, 'Successfully copied'))
    }
    if (existingNodesCount > 0) {
      parts.push(
        `${existingNodesCount} item${existingNodesCount > 1 ? 's' : ''} already existed in target location and were skipped.`,
      )
    }
    return parts.join(' ')
  }

  private possiblySetParentFolder(
    sourceNode: Node,
    targetNode: Node,
    targetScope: EntityScope,
    sourceFoldersMap: Map<number, Node>,
    targetFolderId?: number,
  ): void {
    const targetParentFolderId = this.getTargetParentFolderId(sourceNode, sourceFoldersMap, targetFolderId)
    if (targetParentFolderId !== undefined && targetParentFolderId !== null) {
      this.possiblySetTargetParentFolderId(targetScope, targetNode, targetParentFolderId)
    }
  }

  /**
   * Orders nodes so that any parent folder present in the batch comes before
   * all of its descendants. The copy loop registers copied folders in
   * sourceFoldersMap and children look their new parent up there, so
   * processing a child before its parent would silently re-root it.
   * Nodes without an in-batch parent keep their relative order.
   */
  private sortParentsFirst(nodes: Node[]): Node[] {
    const nodesById = new Map(nodes.map(node => [node.id, node]))
    const visited = new Set<number>()
    const ordered: Node[] = []

    const visit = (node: Node): void => {
      if (visited.has(node.id)) {
        return
      }
      visited.add(node.id)

      const parentId = this.getParentFolderId(node)
      const parent = parentId != null ? nodesById.get(parentId) : undefined
      if (parent) {
        visit(parent)
      }

      ordered.push(node)
    }

    for (const node of nodes) {
      visit(node)
    }

    return ordered
  }

  private getTargetParentFolderId(
    sourceNode: Node,
    sourceFoldersMap: Map<number, Node>,
    targetFolderId?: number,
  ): number | undefined {
    if (this.hasParentFolder(sourceNode)) {
      const targetFolderFromSource = sourceFoldersMap.get(this.getParentFolderId(sourceNode))
      if (targetFolderFromSource) {
        return targetFolderFromSource.id
      }
    }

    return targetFolderId
  }

  private getParentFolderId(node: Node): number | undefined {
    return node.scopedParentFolderId ?? node.parentFolderId
  }

  private hasParentFolder(node: Node): boolean {
    return (
      (node.parentFolderId !== null && node.parentFolderId !== undefined) ||
      (node.scopedParentFolderId !== null && node.scopedParentFolderId !== undefined)
    )
  }

  /**
   * Tries to find existing node in target location to avoid duplicates and reuse if its folder.
   *
   * @param sourceNode
   * @param targetScope
   * @param user
   * @param targetFolderId
   * @private
   */
  private async getExistingNode(
    sourceNode: Node,
    targetScope: EntityScope,
    user: User,
    destinationProject: `project-${string}`,
    targetFolderId?: number,
  ): Promise<Node | null> {
    if (sourceNode.isFolder) {
      const conditions: Partial<Folder> = {
        stiType: sourceNode.stiType,
        user: Reference.create(user),
        scope: targetScope,
        name: sourceNode.name,
      }
      this.possiblySetTargetParentFolderId(targetScope, conditions, targetFolderId)
      return await this.em.findOne(Node, conditions)
    }

    if (sourceNode.isFile || sourceNode.isAsset) {
      const conditions: Partial<Asset> = {
        stiType: sourceNode.stiType,
        dxid: (sourceNode as FileOrAsset).dxid,
        project: destinationProject,
      }
      return await this.em.findOne(Node, conditions)
    }

    return null
  }

  private possiblySetTargetParentFolderId(
    targetScope: EntityScope,
    targetNode: Partial<Node>,
    parentFolderId?: number,
  ): void {
    const resolvedParentId = parentFolderId || null

    if (targetScope.startsWith('space')) {
      targetNode.scopedParentFolderId = resolvedParentId
    } else {
      targetNode.parentFolderId = resolvedParentId
    }
  }
}
