import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Event, EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { NodeTagging } from '@shared/domain/tagging/node-tagging.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { FILE_STI_TYPE, FileOrAsset, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { EntityScope } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

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
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
  ) {}

  async copyNodes(requestedIds: number[], targetScope: EntityScope, targetFolderId?: number): Promise<void> {
    this.logger.log(
      `Copying nodes with ids: [${requestedIds.join(', ')}] to folderId: ${targetFolderId} within scope: ${targetScope}`,
    )

    const user = await this.user.loadEntity()

    const nodes = await this.nodeService.loadNodes(requestedIds, {})

    // Validate that all nodes are from the same project
    const sourceProject = nodes[0]?.project
    const fileNodes = nodes.filter(node => node.isFile)
    const allSameProject = fileNodes.every(node => node.project === sourceProject)
    if (!allSameProject) {
      throw new InvalidStateError('All nodes to be copied must belong to the same source project.')
    }

    const destinationProject = await this.getDestinationProjectId(targetScope, user)
    const fileDxIds = nodes.filter(node => node.isFile || node.isAsset).map((n: FileOrAsset) => n.dxid)

    try {
      await this.platformClient.projectClone(sourceProject, destinationProject, fileDxIds)
    } catch (error: unknown) {
      // permissions are most likely missing - log and notify user
      this.logger.error('An error occurred while copying nodes', error as Error)
      await this.processErrorNotification()
      return
    }

    let newlyCreatedFilesCount = 0
    let newlyCreatedFoldersCount = 0
    const nodesExistingInTarget: Node[] = []

    const nodesToProcess = [...nodes].reverse()
    const sourceFoldersMap = new Map<number, Node>()
    for (const sourceNode of nodesToProcess) {
      await this.validateNode(sourceNode)
    }

    try {
      await this.em.transactional(async tem => {
        for (const sourceNode of nodesToProcess) {
          const existingNode = await this.getExistingNode(sourceNode, targetScope, user, targetFolderId)
          if (existingNode) {
            this.logger.log(`Node with uid: ${sourceNode.uid} already exists in target. Skipping.`)

            if (existingNode.stiType === FILE_STI_TYPE.FOLDER) {
              sourceFoldersMap.set(sourceNode.id, existingNode)
            }

            nodesExistingInTarget.push(existingNode)
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

          if (newlyCreatedNode.isFile) {
            newlyCreatedFilesCount++
          } else {
            newlyCreatedFoldersCount++
          }
        }
      })
      await this.processInfoNotification(nodesExistingInTarget.length, newlyCreatedFilesCount, newlyCreatedFoldersCount)
    } catch (error: unknown) {
      // collect all dxids of cloned files and rollback
      const dxids = nodes.filter(node => node.isFile).map((n: FileOrAsset) => n.dxid)
      // filter out nodes that existed in target to avoid deleting user's existing files
      const dxidsToRollback = dxids.filter(
        dxid => !nodesExistingInTarget.find((node: FileOrAsset) => node.dxid === dxid),
      )

      const chunkSize = 100
      for (let i = 0; i < dxidsToRollback.length; i += chunkSize) {
        const batch = dxidsToRollback.slice(i, i + chunkSize)
        await this.platformClient.containerRemoveObjects(destinationProject, batch)
      }

      this.logger.error('An error occurred while copying nodes', error as Error)
      await this.processErrorNotification()
    }
  }

  private async validateNode(node: Node): Promise<void> {
    const result = await this.nodeService.getAccessibleEntityById(node.id)
    if (!result) {
      throw new NotFoundError(`Node with id ${node.id} is not accessible or does not exist`)
    }

    await this.nodeService.validateProtectedSpaces('copy', this.user.id, node)
    if ((result.isFile || result.isAsset) && result.state !== 'closed') {
      throw new InvalidStateError(`Only files in 'closed' state can be copied.`)
    }
    if (result.isFolder && result.state === 'removing') {
      throw new InvalidStateError(`Folder in 'removing' state cannot be copied.`)
    }
  }

  private async processEvents(
    newlyCreatedNode: UserFile | Asset | Folder,
    user: User,
    sourceNode: Node,
    sourceFoldersMap: Map<number, Node>,
  ): Promise<void> {
    if (newlyCreatedNode.isInSpace() && newlyCreatedNode.isFile) {
      const spaceEvent = await this.spaceEventService.createSpaceEvent({
        activityType: SPACE_EVENT_ACTIVITY_TYPE.file_added,
        entity: { type: 'userFile', value: newlyCreatedNode },
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
          ;(newlyCreatedNode as Asset).archiveEntries.add(archiveEntry)
        }
      }
    }
  }

  private async processErrorNotification(): Promise<void> {
    await this.notificationService.createNotification({
      message: `An error occurred while copying your files. Please try again later.`,
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.NODES_COPIED,
      userId: this.user.id,
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
    let newlyCreatedNode
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
    if (this.hasParentFolder(sourceNode)) {
      const parentId = this.getParentFolderId(sourceNode)
      const targetFolderFromSource = sourceFoldersMap.get(parentId)

      if (targetFolderFromSource) {
        this.possiblySetTargetParentFolderId(targetScope, targetNode, targetFolderFromSource.id)
      }
    }
    // if no parent folder is set on target and targetFolderId is provided use it
    if (!this.hasParentFolder(targetNode) && targetFolderId !== null && targetFolderId !== undefined) {
      this.possiblySetTargetParentFolderId(targetScope, targetNode, targetFolderId)
    }
  }

  private getParentFolderId(node: Node): number | undefined {
    return node.scopedParentFolderId ?? node.parentFolderId!
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
    targetFolderId?: number,
  ): Promise<Node> {
    const conditions: Partial<Asset> = {
      stiType: sourceNode.stiType,
      user: Reference.create(user),
      scope: targetScope,
    }

    if (sourceNode.isFolder) {
      conditions.name = sourceNode.name
    }

    if (sourceNode.isFile || sourceNode.isAsset) {
      conditions.dxid = (sourceNode as FileOrAsset).dxid
    }

    this.possiblySetTargetParentFolderId(targetScope, conditions, targetFolderId)

    return await this.em.findOne(Node, conditions)
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

  private async getDestinationProjectId(scope: EntityScope, user: User): Promise<DxId<'project'>> {
    if (EntityScopeUtils.isPublic(scope)) {
      return user.publicFilesProject
    } else if (EntityScopeUtils.isPrivate(scope)) {
      return user.privateFilesProject
    } else if (EntityScopeUtils.isSpaceScope(scope)) {
      const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
      const membership = await this.spaceMembershipRepo.getMembership(spaceId, user.id)
      await membership.spaces.load()
      return membership.isHost ? membership.spaces[0].hostProject : membership.spaces[0].guestProject
    }
  }
}
