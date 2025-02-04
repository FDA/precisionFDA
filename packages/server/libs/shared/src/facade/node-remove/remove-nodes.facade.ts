import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserRepository } from '@shared/domain/user/user.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { getNodePath } from '@shared/domain/user-file/user-file.helper'
import { createFileEvent, createFolderEvent, EVENT_TYPES } from '@shared/domain/event/event.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { PlatformClient } from '@shared/platform-client'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Injectable()
export class RemoveNodesFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userRepository: UserRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly userFileRepository: UserFileRepository,
    private readonly comparisonService: ComparisonService,
    private readonly userFileService: UserFileService,
    private readonly nodeService: NodeService,
    private readonly spaceService: SpaceService,
    private readonly taggingService: TaggingService,
    private readonly spaceEventService: SpaceEventService,
    private readonly licensedItemService: LicensedItemService,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
    private readonly userClient: PlatformClient,
  ) {}

  /**
   * Removes all files and folders specified by id in input. Operation traverses
   * also through children.
   * @param ids
   * @param skipValidation
   */
  async removeNodes(ids: number[], skipValidation: boolean = false) {
    this.logger.log(`Removing nodes ${ids}`)
    // load all nested ids (even those not explicitly mentioned)
    const nodes: Node[] = await this.nodeService.loadNodes(ids, {})

    if (!skipValidation) {
      await this.validateNodes(nodes)
    }

    let removedFilesCount = 0
    let removedFoldersCount = 0

    try {
      // required because of a bug in the orm, where an entity fetched as part of a related collection to a different entity gets inserted back into the database in case it is deleted in very specific situations.
      // this might get fixed in the future in the ORM and therefore the clear might not be needed anymore
      // see JIRA PFDA-5169 for reproduction steps
      this.em.clear()

      for (const node of nodes) {
        if (node.stiType === FILE_STI_TYPE.USERFILE) {
          await this.removeFile(node as UserFile)
          removedFilesCount++
        } else {
          await this.removeFolder(node as Folder)
          removedFoldersCount++
        }
      }

      this.logger.log(
        { foldersCount: removedFoldersCount, filesCount: removedFilesCount },
        'Removed total objects',
      )
    } catch (error) {
      await this.nodeService.rollbackRemovingState(nodes)
      throw error
    }
    return { removedFilesCount, removedFoldersCount }
  }

  async removeNodesAsync(ids: number[]) {
    this.logger.log(`Asynchronously removing nodes ${ids}`)
    // load all nested ids (even those not explicitly mentioned)
    const nodes: Node[] = await this.nodeService.loadNodes(ids, {})
    const loadedIds = nodes.map((node) => node.id)
    await this.validateNodes(nodes)

    await this.em.transactional(async () => {
      await this.nodeService.markNodesAsRemoving(loadedIds)
      await this.fileSyncQueueJobProducer.createRemoveNodesJobTask(loadedIds, this.user)
    })
  }

  private async validateNodes(nodes: Node[]) {
    for (const node of nodes) {
      await this.userFileService.validateProtectedSpaces('remove', this.user.id, node)
      await this.nodeService.validateEditableBy(node)
      await this.spaceService.validateVerificationSpace(node)

      if (node.stiType === FILE_STI_TYPE.USERFILE) {
        await this.comparisonService.validateComparisons(node as UserFile)
        await this.userFileService.validateSpaceReports(node as UserFile)
      }
    }
  }

  private async removeFile(fileToRemove: UserFile) {
    this.logger.log(`Removing file with uid: ${fileToRemove.uid}`)

    const lastNode = (await this.userFileRepository.count({ dxid: fileToRemove.dxid })) === 1
    const filePath = await getNodePath(this.em, fileToRemove as Node)
    const user = await this.userRepository.findOne(this.user.id)

    return await this.em.transactional(async () => {
      await this.licensedItemService.removeItemLicensedForNode(fileToRemove.id)
      await this.taggingService.removeTaggings(fileToRemove.id, TAGGABLE_TYPE.NODE)

      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        fileToRemove,
        filePath,
        user,
      )
      this.em.persist(fileEvent)

      if (lastNode) {
        // we're deleting from platform only if it's the last with given dxid
        this.logger.log(`Removing file with dxid: ${fileToRemove.dxid} from platform`)
        await this.userClient.fileRemove({
          projectId: fileToRemove.project,
          ids: [fileToRemove.dxid],
        })
      }

      if (fileToRemove.isInSpace()) {
        await this.spaceEventService.createSpaceEvent({
          entity: { type: 'userFile', value: fileToRemove },
          spaceId: fileToRemove.getSpaceId(),
          userId: this.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        })
      }

      this.em.remove(fileToRemove)
      this.logger.log(`Removed file with uid: ${fileToRemove.uid}`)
      return 1
    })
  }

  private async removeFolder(folderToRemove: Folder) {
    const user = await this.userRepository.findOne(this.user.id)
    const folderPath = await getNodePath(this.em, folderToRemove)

    return await this.em.transactional(async () => {
      const folderEvent = await createFolderEvent(
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
