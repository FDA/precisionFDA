import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { ClientRequestError } from '@shared/errors'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { PlatformClient } from '@shared/platform-client'

describe('RemoveNodesFacade', () => {
  const USER_ID = 1
  const user = {
    id: USER_ID,
  }
  const userCtx = {
    id: USER_ID,
    loadEntity: async () => user,
  } as UserContext

  const emTransactionalStub = stub().callsArg(0)
  const emClearStub = stub()
  const emPersistStub = stub()
  const emRemoveStub = stub()
  const nodeServiceLoadNodesStub = stub()
  const nodeServiceValidateEditableByStub = stub()
  const spaceServiceValidateVerificationSpaceStub = stub()
  const comparisonServiceValidateComparisonsStub = stub()
  const nodeServiceMarkNodesAsRemovingStub = stub()
  const queueCreateRemoveNodesJobTaskStub = stub()
  const nodeServiceRollbackRemovingStateStub = stub()
  const nodeServiceValidateAssetRemovalStub = stub()
  const nodeServiceValidateProtectedSpacesStub = stub()
  const nodeServiceValidateSpaceReportsStub = stub()
  const userFileRepositoryCountStub = stub()
  const licensedItemServiceRemoveItemLicensedForNodeStub = stub()
  const removeArchiveEntriesForNodeStub = stub()
  const taggingServiceRemoveTaggingsStub = stub()
  const userClientFileRemoveStub = stub()
  const spaceEventServiceCreateAndSendSpaceEventStub = stub()
  const nodeHelperGetNodePathStub = stub()
  const eventHelperCreateFileEventStub = stub()
  const eventHelperCreateFolderEventStub = stub()
  const dataPortalServiceValidatePortalImageStub = stub()

  const createRemoveNodesFacade = (): RemoveNodesFacade => {
    const em = {
      transactional: emTransactionalStub,
      clear: emClearStub,
      persist: emPersistStub,
      remove: emRemoveStub,
    } as unknown as SqlEntityManager
    const userFileRepository = {
      count: userFileRepositoryCountStub,
    } as unknown as UserFileRepository
    const comparisonService = {
      validateComparisons: comparisonServiceValidateComparisonsStub,
    } as unknown as ComparisonService
    const nodeService = {
      loadNodes: nodeServiceLoadNodesStub,
      validateEditableBy: nodeServiceValidateEditableByStub,
      markNodesAsRemoving: nodeServiceMarkNodesAsRemovingStub,
      rollbackRemovingState: nodeServiceRollbackRemovingStateStub,
      validateAssetRemoval: nodeServiceValidateAssetRemovalStub,
      validateProtectedSpaces: nodeServiceValidateProtectedSpacesStub,
      validateSpaceReports: nodeServiceValidateSpaceReportsStub,
    } as unknown as NodeService

    const spaceService = {
      validateVerificationSpace: spaceServiceValidateVerificationSpaceStub,
    } as unknown as SpaceService
    const taggingService = {
      removeTaggings: taggingServiceRemoveTaggingsStub,
    } as unknown as TaggingService
    const spaceEventService = {
      createAndSendSpaceEvent: spaceEventServiceCreateAndSendSpaceEventStub,
    } as unknown as SpaceEventService
    const licensedItemService = {
      removeItemLicensedForNode: licensedItemServiceRemoveItemLicensedForNodeStub,
    } as unknown as LicensedItemService
    const archiveEntryService = {
      removeArchiveEntriesForNode: removeArchiveEntriesForNodeStub,
    } as unknown as ArchiveEntryService
    const fileSyncQueueJobProducer = {
      createRemoveNodesJobTask: queueCreateRemoveNodesJobTaskStub,
    } as unknown as FileSyncQueueJobProducer
    const userClient = {
      fileRemove: userClientFileRemoveStub,
    } as unknown as PlatformClient

    const nodeHelper = {
      getNodePath: nodeHelperGetNodePathStub,
    } as unknown as NodeHelper

    const eventHelper = {
      createFileEvent: eventHelperCreateFileEventStub,
      createFolderEvent: eventHelperCreateFolderEventStub,
    } as unknown as EventHelper

    const dataPortalService = {
      validatePortalImage: dataPortalServiceValidatePortalImageStub,
    } as unknown as DataPortalService

    return new RemoveNodesFacade(
      em,
      userCtx,
      userFileRepository,
      nodeHelper,
      eventHelper,
      comparisonService,
      nodeService,
      spaceService,
      taggingService,
      spaceEventService,
      licensedItemService,
      archiveEntryService,
      dataPortalService,
      fileSyncQueueJobProducer,
      userClient,
    )
  }

  beforeEach(() => {
    emClearStub.reset()
    emClearStub.throws()

    emPersistStub.reset()
    emPersistStub.throws()

    emRemoveStub.reset()
    emRemoveStub.throws()

    nodeServiceLoadNodesStub.reset()
    nodeServiceLoadNodesStub.throws()

    nodeServiceValidateEditableByStub.reset()
    nodeServiceValidateEditableByStub.throws()

    nodeServiceValidateAssetRemovalStub.reset()
    nodeServiceValidateAssetRemovalStub.throws()

    spaceServiceValidateVerificationSpaceStub.reset()
    spaceServiceValidateVerificationSpaceStub.throws()

    comparisonServiceValidateComparisonsStub.reset()
    comparisonServiceValidateComparisonsStub.throws()

    nodeServiceMarkNodesAsRemovingStub.reset()
    nodeServiceMarkNodesAsRemovingStub.throws()

    queueCreateRemoveNodesJobTaskStub.reset()
    queueCreateRemoveNodesJobTaskStub.throws()

    nodeServiceRollbackRemovingStateStub.reset()
    nodeServiceRollbackRemovingStateStub.throws()

    nodeServiceValidateSpaceReportsStub.reset()
    nodeServiceValidateSpaceReportsStub.throws()

    nodeServiceValidateProtectedSpacesStub.reset()
    nodeServiceValidateProtectedSpacesStub.throws()

    userFileRepositoryCountStub.reset()
    userFileRepositoryCountStub.throws()

    licensedItemServiceRemoveItemLicensedForNodeStub.reset()
    licensedItemServiceRemoveItemLicensedForNodeStub.throws()

    removeArchiveEntriesForNodeStub.reset()
    removeArchiveEntriesForNodeStub.throws()

    taggingServiceRemoveTaggingsStub.reset()
    taggingServiceRemoveTaggingsStub.throws()

    userClientFileRemoveStub.reset()
    userClientFileRemoveStub.throws()

    spaceEventServiceCreateAndSendSpaceEventStub.reset()
    spaceEventServiceCreateAndSendSpaceEventStub.throws()

    nodeHelperGetNodePathStub.reset()
    nodeHelperGetNodePathStub.throws()

    eventHelperCreateFileEventStub.reset()
    eventHelperCreateFileEventStub.throws()

    eventHelperCreateFolderEventStub.reset()
    eventHelperCreateFolderEventStub.throws()

    dataPortalServiceValidatePortalImageStub.reset()
    dataPortalServiceValidatePortalImageStub.throws()
    dataPortalServiceValidatePortalImageStub.resolves()
  })

  describe('#removeNodesAsync', () => {
    it('basic', async () => {
      const ids = [1, 2, 3]
      const node1 = { id: 1, stiType: FILE_STI_TYPE.USERFILE } as unknown as UserFile
      const node2 = { id: 2, stiType: FILE_STI_TYPE.ASSET } as unknown as UserFile
      const node3 = { id: 3, stiType: FILE_STI_TYPE.FOLDER } as unknown as Folder
      const nodes = [node1, node2, node3]

      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      nodeServiceValidateEditableByStub.reset()
      spaceServiceValidateVerificationSpaceStub.reset()
      nodeServiceValidateProtectedSpacesStub.reset()
      nodeServiceValidateSpaceReportsStub.reset()
      nodeServiceMarkNodesAsRemovingStub.reset()
      comparisonServiceValidateComparisonsStub.reset()
      queueCreateRemoveNodesJobTaskStub.reset()
      nodeServiceValidateAssetRemovalStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      await removeNodesFacade.removeNodesAsync(ids)

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true()
      expect(nodeServiceLoadNodesStub.calledWith(ids, {})).to.be.true()

      expect(nodeServiceValidateProtectedSpacesStub.calledThrice).to.be.true()
      expect(nodeServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node1)).to.be.true()
      expect(nodeServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node2)).to.be.true()
      expect(nodeServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node3)).to.be.true()

      expect(nodeServiceValidateEditableByStub.calledThrice).to.be.true()
      expect(nodeServiceValidateEditableByStub.calledWith(node1)).to.be.true()
      expect(nodeServiceValidateEditableByStub.calledWith(node2)).to.be.true()
      expect(nodeServiceValidateEditableByStub.calledWith(node3)).to.be.true()

      expect(spaceServiceValidateVerificationSpaceStub.calledThrice).to.be.true()
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node1)).to.be.true()
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node2)).to.be.true()
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node3)).to.be.true()

      expect(comparisonServiceValidateComparisonsStub.calledOnce).to.be.true()
      expect(comparisonServiceValidateComparisonsStub.calledWith(node1)).to.be.true()

      expect(nodeServiceValidateSpaceReportsStub.calledOnce).to.be.true()
      expect(nodeServiceValidateSpaceReportsStub.calledWith(node1)).to.be.true()

      expect(nodeServiceMarkNodesAsRemovingStub.calledOnce).to.be.true()
      expect(nodeServiceMarkNodesAsRemovingStub.calledWith(ids)).to.be.true()

      expect(queueCreateRemoveNodesJobTaskStub.calledOnce).to.be.true()
      expect(queueCreateRemoveNodesJobTaskStub.calledWith(ids, userCtx)).to.be.true()

      expect(nodeServiceValidateAssetRemovalStub.calledOnce).to.be.true()
      expect(nodeServiceValidateAssetRemovalStub.calledWith(node2)).to.be.true()
    })
  })

  describe('#removeNodes', () => {
    it('basic', async () => {
      const ids = [1, 2, 3]
      const node1 = {
        id: 1,
        name: 'node1',
        isInSpace: () => true,
        getSpaceId: () => 1,
        dxid: 'file-1',
        project: 'project-id',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const node2 = {
        id: 2,
        name: 'node2',
        isInSpace: () => false,
        dxid: 'file-2',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const folder1 = { id: 3, name: 'folder1', stiType: FILE_STI_TYPE.FOLDER } as unknown as Folder
      const nodes = [node1, node2, folder1]

      nodeHelperGetNodePathStub.callsFake((node: Node) => {
        return `/path/to/${node.name}`
      })
      eventHelperCreateFileEventStub.reset()
      eventHelperCreateFolderEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).returns(2)
      licensedItemServiceRemoveItemLicensedForNodeStub.reset()
      taggingServiceRemoveTaggingsStub.reset()
      emPersistStub.reset()
      userClientFileRemoveStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()
      emRemoveStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      // validations are tested in the async case
      const result = await removeNodesFacade.removeNodes(ids, true)
      expect(result).to.deep.equal({ removedFilesCount: 2, removedFoldersCount: 1 })

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true()
      expect(nodeServiceLoadNodesStub.calledWith(ids)).to.be.true()

      expect(emClearStub.calledOnce).to.be.true()

      expect(userFileRepositoryCountStub.calledTwice).to.be.true()
      expect(userFileRepositoryCountStub.calledWith({ dxid: node1.dxid })).to.be.true()
      expect(userFileRepositoryCountStub.calledWith({ dxid: node2.dxid })).to.be.true()

      expect(nodeHelperGetNodePathStub.calledThrice).to.be.true()

      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledTwice).to.be.true()
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node1.id)).to.be.true()
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node2.id)).to.be.true()

      expect(taggingServiceRemoveTaggingsStub.calledTwice).to.be.true()

      expect(eventHelperCreateFileEventStub.calledTwice).to.be.true()
      expect(
        eventHelperCreateFileEventStub.calledWith(EVENT_TYPES.FILE_DELETED, node1, '/path/to/node1', user),
      ).to.be.true()
      expect(
        eventHelperCreateFileEventStub.calledWith(EVENT_TYPES.FILE_DELETED, node2, '/path/to/node2', user),
      ).to.be.true()
      expect(userClientFileRemoveStub.calledOnce).to.be.true()
      expect(
        userClientFileRemoveStub.calledWith({
          projectId: 'project-id',
          ids: ['file-1'],
        }),
      ).to.be.true()
      expect(spaceEventServiceCreateAndSendSpaceEventStub.calledOnce).to.be.true()
      expect(
        spaceEventServiceCreateAndSendSpaceEventStub.calledWith({
          entity: { type: 'userFile', value: node1 },
          spaceId: node1.getSpaceId(),
          userId: USER_ID,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        }),
      )

      expect(emRemoveStub.calledThrice).to.be.true()
      expect(emRemoveStub.calledWith(node1)).to.be.true()
      expect(emRemoveStub.calledWith(node2)).to.be.true()
      expect(emRemoveStub.calledWith(folder1)).to.be.true()

      expect(emPersistStub.calledThrice).to.be.true()

      expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
      expect(
        eventHelperCreateFolderEventStub.calledWith('folder_deleted', folder1, '/path/to/folder1', {
          id: USER_ID,
        }),
      )
    })

    it('file already gone from platform', async () => {
      const ids = [1, 2]
      const node1 = {
        id: 1,
        name: 'node1',
        isInSpace: () => true,
        getSpaceId: () => 1,
        project: 'project-id',
        dxid: 'file-1',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const node2 = {
        id: 2,
        name: 'node2',
        isInSpace: () => false,
        dxid: 'file-2',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const nodes = [node1, node2]

      nodeHelperGetNodePathStub.callsFake((node: Node) => {
        return `/path/to/${node.name}`
      })
      eventHelperCreateFileEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).returns(2)
      licensedItemServiceRemoveItemLicensedForNodeStub.reset()
      taggingServiceRemoveTaggingsStub.reset()
      emPersistStub.reset()
      userClientFileRemoveStub.reset()
      userClientFileRemoveStub
        .withArgs({
          projectId: node1.project,
          ids: [node1.dxid],
        })
        .throws(
          new ClientRequestError('File not found', {
            clientStatusCode: 404,
            clientResponse: '',
          }),
        )
      spaceEventServiceCreateAndSendSpaceEventStub.reset()
      emRemoveStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      // validations are tested in the async case
      const result = await removeNodesFacade.removeNodes(ids, true)
      expect(result).to.deep.equal({ removedFilesCount: 2, removedFoldersCount: 0 })

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true()
      expect(nodeServiceLoadNodesStub.calledWith(ids)).to.be.true()

      expect(emClearStub.calledOnce).to.be.true()

      expect(userFileRepositoryCountStub.calledTwice).to.be.true()
      expect(userFileRepositoryCountStub.calledWith({ dxid: node1.dxid })).to.be.true()
      expect(userFileRepositoryCountStub.calledWith({ dxid: node2.dxid })).to.be.true()

      expect(nodeHelperGetNodePathStub.calledTwice).to.be.true()

      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledTwice).to.be.true()
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node1.id)).to.be.true()
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node2.id)).to.be.true()

      expect(taggingServiceRemoveTaggingsStub.calledTwice).to.be.true()
      expect(taggingServiceRemoveTaggingsStub.calledWith(node1.id, TAGGABLE_TYPE.NODE)).to.be.true()
      expect(taggingServiceRemoveTaggingsStub.calledWith(node2.id, TAGGABLE_TYPE.NODE)).to.be.true()

      expect(eventHelperCreateFileEventStub.calledTwice).to.be.true()
      expect(
        eventHelperCreateFileEventStub.calledWith(EVENT_TYPES.FILE_DELETED, node1, '/path/to/node1', user),
      ).to.be.true()
      expect(
        eventHelperCreateFileEventStub.calledWith(EVENT_TYPES.FILE_DELETED, node2, '/path/to/node2', user),
      ).to.be.true()

      expect(userClientFileRemoveStub.calledOnce).to.be.true()
      expect(
        userClientFileRemoveStub.calledWith({
          projectId: 'project-id',
          ids: ['file-1'],
        }),
      ).to.be.true()

      expect(spaceEventServiceCreateAndSendSpaceEventStub.calledOnce).to.be.true()
      expect(
        spaceEventServiceCreateAndSendSpaceEventStub.calledWith({
          entity: { type: 'userFile', value: node1 },
          spaceId: node1.getSpaceId(),
          userId: USER_ID,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        }),
      )

      expect(emRemoveStub.calledTwice).to.be.true()
      expect(emRemoveStub.calledWith(node1)).to.be.true()
      expect(emRemoveStub.calledWith(node2)).to.be.true()

      expect(emPersistStub.calledTwice).to.be.true()
    })

    it('trigger rollbackRemovingState', async () => {
      const ids = [1, 2, 3]
      const node1 = {
        id: 1,
        name: 'node1',
        isInSpace: () => true,
        getSpaceId: () => 1,
        project: 'project-id',
        dxid: 'file-1',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const node2 = {
        id: 2,
        name: 'node2',
        isInSpace: () => false,
        dxid: 'file-2',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const node3 = { id: 3, stiType: FILE_STI_TYPE.FOLDER } as unknown as Folder
      const nodes = [node1, node2, node3]

      nodeHelperGetNodePathStub.callsFake((node: Node) => {
        return `/path/to/${node.name}`
      })
      eventHelperCreateFileEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      // simulate any kind of error
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).throws(new Error('Error'))
      licensedItemServiceRemoveItemLicensedForNodeStub.reset()
      taggingServiceRemoveTaggingsStub.reset()
      emPersistStub.reset()
      userClientFileRemoveStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()
      emRemoveStub.reset()

      nodeServiceRollbackRemovingStateStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      const removeNodesFacade = createRemoveNodesFacade()

      await expect(removeNodesFacade.removeNodes(ids, true)).to.be.rejectedWith(Error, 'Error')

      expect(nodeServiceRollbackRemovingStateStub.calledOnce).to.be.true()
      expect(nodeServiceRollbackRemovingStateStub.calledWith([node2, node3])).to.be.true()
    })

    it('should not create space event when skipCreateSpaceEvent is true', async () => {
      const node1 = {
        id: 1,
        name: 'node1',
        isInSpace: () => true,
        getSpaceId: () => 111,
        dxid: 'file-1',
        project: 'project-id',
        stiType: FILE_STI_TYPE.USERFILE,
      } as unknown as UserFile
      const nodes = [node1]

      nodeHelperGetNodePathStub.callsFake((node: Node) => {
        return `/path/to/${node.name}`
      })

      eventHelperCreateFileEventStub.reset()
      nodeServiceLoadNodesStub.withArgs([node1.id]).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      licensedItemServiceRemoveItemLicensedForNodeStub.reset()
      taggingServiceRemoveTaggingsStub.reset()
      emPersistStub.reset()
      userClientFileRemoveStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()
      emRemoveStub.reset()
      nodeServiceValidateProtectedSpacesStub.reset()
      nodeServiceValidateEditableByStub.reset()
      spaceServiceValidateVerificationSpaceStub.reset()
      comparisonServiceValidateComparisonsStub.reset()
      nodeServiceValidateSpaceReportsStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      const result = await removeNodesFacade.removeFile(node1, true)

      expect(result).to.deep.equal(1)

      expect(spaceEventServiceCreateAndSendSpaceEventStub.called).to.be.false()

      expect(emRemoveStub.calledOnce).to.be.true()
      expect(emRemoveStub.calledWith(node1)).to.be.true()

      expect(eventHelperCreateFileEventStub.calledOnce).to.be.true()
      expect(
        eventHelperCreateFileEventStub.calledWith(EVENT_TYPES.FILE_DELETED, node1, '/path/to/node1', user),
      ).to.be.true()

      expect(userClientFileRemoveStub.calledOnce).to.be.true()
    })
  })
})
