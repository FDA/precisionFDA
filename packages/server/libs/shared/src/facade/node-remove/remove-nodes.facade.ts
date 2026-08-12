import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { FILE_STI_TYPE, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { ClientRequestError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class RemoveNodesFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userFileRepository: UserFileRepository,
    private readonly nodeHelper: NodeHelper,
    private readonly eventHelper: EventHelper,
    private readonly comparisonService: ComparisonService,
    private readonly nodeService: NodeService,
    private readonly spaceService: SpaceService,
    private readonly taggingService: TaggingService,
    private readonly spaceEventService: SpaceEventService,
    private readonly licensedItemService: LicensedItemService,
    private readonly archiveEntryService: ArchiveEntryService,
    private readonly dataPortalService: DataPortalService,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminPlatformClient: PlatformClient,
  ) {}

  /**
   * Removes all files and folders specified by id in input. Operation traverses
   * also through children.
   * @param ids
   * @param skipValidation
   */
  async removeNodes(
    ids: number[],
    skipValidation: boolean = false,
  ): Promise<{
    removedFilesCount: number
    removedFoldersCount: number
  }> {
    this.logger.log(`Removing nodes ${ids}`)
    // load all nested ids (even those not explicitly mentioned)
    const nodes = await this.nodeService.loadNodes(ids, {})

    if (!skipValidation) {
      await this.validateNodes(nodes)
    }

    // required because of a bug in the orm, where an entity fetched as part of a related collection to a different entity gets inserted back into the database in case it is deleted in very specific situations.
    // this might get fixed in the future in the ORM and therefore the clear might not be needed anymore
    // see JIRA PFDA-5169 for reproduction steps
    this.em.clear()

    let removedFilesCount = 0
    let removedFoldersCount = 0

    try {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        switch (node.stiType) {
          case FILE_STI_TYPE.USERFILE:
          case FILE_STI_TYPE.ASSET:
            await this.removeFile(node as FileOrAsset)
            removedFilesCount++
            break
          case FILE_STI_TYPE.FOLDER:
            await this.removeFolder(node as Folder)
            removedFoldersCount++
            break
          default:
            throw new Error(`Unsupported node type: ${node.stiType}`)
        }

        // Mark as processed to exclude from potential rollback later
        nodes[i] = null as unknown as Node
      }

      this.logger.log({ foldersCount: removedFoldersCount, filesCount: removedFilesCount }, 'Removed total objects')
    } catch (error) {
      const undeletedNodes = nodes.filter((node): node is Node => node !== null)
      await this.nodeService.rollbackRemovingState(undeletedNodes)
      throw error
    }

    return { removedFilesCount, removedFoldersCount }
  }

  async removeNodesAsync(ids: number[]): Promise<void> {
    this.logger.log(`Asynchronously removing nodes ${ids}`)
    // load all nested ids (even those not explicitly mentioned)
    const nodes: Node[] = await this.nodeService.loadNodes(ids, {})
    const loadedIds = nodes.map(node => node.id)
    await this.validateNodes(nodes)

    await this.nodeService.markNodesAsRemoving(loadedIds)
    try {
      // enqueued only after the state change is committed - the Redis queue is not part of the DB transaction
      await this.fileSyncQueueJobProducer.createRemoveNodesJobTask(loadedIds, this.user)
    } catch (error) {
      await this.nodeService.rollbackRemovingState(nodes)
      throw error
    }
  }

  private async validateNodes(nodes: Node[]): Promise<void> {
    for (const node of nodes) {
      await this.nodeService.validateProtectedSpaces('remove', this.user.id, node)
      await this.nodeService.validateEditableBy(node)
      await this.spaceService.validateVerificationSpace(node)

      if (node.stiType === FILE_STI_TYPE.USERFILE) {
        await this.comparisonService.validateComparisons(node as UserFile)
        await this.nodeService.validateSpaceReports(node as UserFile)
        await this.dataPortalService.validatePortalImage(node.id)
      }
      if (node.stiType === FILE_STI_TYPE.ASSET) {
        await this.nodeService.validateAssetRemoval(node as Asset)
      }
    }
  }

  public async removeFile(fileToRemove: FileOrAsset, skipCreateSpaceEvent?: boolean): Promise<number> {
    this.logger.log(`Removing file with uid: ${fileToRemove.uid}`)

    const lastNode = (await this.userFileRepository.count({ dxid: fileToRemove.dxid })) === 1
    const filePath = await this.nodeHelper.getNodePath(fileToRemove)
    const user = await this.user.loadEntity()
    let spaceEvent: SpaceEvent | undefined
    await this.em.transactional(async () => {
      await this.licensedItemService.removeItemLicensedForNode(fileToRemove.id)
      await this.taggingService.removeTaggings(fileToRemove.id, TAGGABLE_TYPE.NODE)

      if (fileToRemove.stiType === FILE_STI_TYPE.ASSET) {
        await this.archiveEntryService.removeArchiveEntriesForNode(fileToRemove.id)
      }

      const fileEvent = await this.eventHelper.createFileEvent(EVENT_TYPES.FILE_DELETED, fileToRemove, filePath, user)
      this.em.persist(fileEvent)

      if (lastNode) {
        // we're deleting from platform only if it's the last with given dxid
        await this.removeFileFromPlatform(fileToRemove)
      }

      if (fileToRemove.isInSpace() && !skipCreateSpaceEvent) {
        spaceEvent = await this.spaceEventService.createSpaceEvent({
          entity: { type: 'userFile', value: fileToRemove },
          spaceId: fileToRemove.getSpaceId(),
          userId: this.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        })
      }

      this.em.remove(fileToRemove)
      this.logger.log(`Removed file with uid: ${fileToRemove.uid}`)
    })

    if (spaceEvent) {
      // sent after commit so the SMTP round trips don't hold the transaction open
      await this.spaceEventService.sendNotificationForEvent(spaceEvent)
    }

    return 1
  }

  /**
   * Removes the file from the platform.
   */
  private async removeFileFromPlatform(file: FileOrAsset): Promise<void> {
    if (file.isPublic()) {
      // public files live in a project the requesting user (even a site admin) is generally not
      // a member of, so use the admin platform client to perform the removal for them
      await this.removePublicFileFromPlatformAsAdmin(file)
    } else {
      this.logger.log(`Removing file with dxid: ${file.dxid} from platform`)
      await this.fileRemoveTolerating404(this.userClient, file)
    }
  }

  /**
   * Calls fileRemove and tolerates a 404 (the file is already gone from the platform).
   * Only the fileRemove call is guarded - errors from other platform calls (e.g. project
   * invite/leave) must still propagate so a failed removal never silently deletes the DB record.
   */
  private async fileRemoveTolerating404(client: PlatformClient, file: FileOrAsset): Promise<void> {
    try {
      await client.fileRemove({
        projectId: file.project,
        ids: [file.dxid],
      })
    } catch (error) {
      if (error instanceof ClientRequestError && error.props?.clientStatusCode === 404) {
        this.logger.log(`File with dxid ${file.dxid} already does not exist on platform`)
      } else {
        throw error
      }
    }
  }

  /**
   * The admin user temporarily self-grants ADMINISTER access to the file's project,
   * removes the file and revokes the access again.
   */
  private async removePublicFileFromPlatformAsAdmin(file: FileOrAsset): Promise<void> {
    const adminUserId = `user-${config.platform.adminUser}`
    this.logger.log(`Removing public file with dxid: ${file.dxid} from platform using admin platform client`)

    await this.adminPlatformClient.projectInvite(file.project, adminUserId, 'ADMINISTER')
    try {
      await this.fileRemoveTolerating404(this.adminPlatformClient, file)
    } finally {
      // Best-effort revoke of the temporary access, even when fileRemove fails. A failure to
      // revoke must not override the outcome of the file removal - otherwise a cleanup error
      // would roll back an already-completed platform deletion (leaving a dangling DB record)
      // or mask a benign 404 for a file that was already gone.
      try {
        await this.adminPlatformClient.projectLeave({ projectDxid: file.project })
      } catch (error) {
        this.logger.error(
          { error },
          `Failed to revoke temporary admin access to project ${file.project} after removing public file ${file.dxid}`,
        )
      }
    }
  }

  private async removeFolder(folderToRemove: Folder): Promise<number> {
    const user = await this.user.loadEntity()
    const folderPath = await this.nodeHelper.getNodePath(folderToRemove)

    return await this.em.transactional(async () => {
      const folderEvent = await this.eventHelper.createFolderEvent(
        EVENT_TYPES.FOLDER_DELETED,
        folderToRemove,
        folderPath,
        user,
      )

      this.em.persist(folderEvent)
      this.em.remove(folderToRemove)
      this.logger.log(`Removed folder with id: ${folderToRemove.id}`)
      return 1
    })
  }
}
