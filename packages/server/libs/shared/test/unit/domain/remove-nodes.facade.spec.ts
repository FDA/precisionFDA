import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserRepository } from '@shared/domain/user/user.repository'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { NodeService } from '@shared/domain/user-file/node.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import * as eventHelper from '@shared/domain/event/event.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'

describe('RemoveNodesFacade', () => {
  const USER_ID = 1
  const userCtx = {
    id: USER_ID,
  } as UserContext

  let getNodePathStub
  let createFileEventStub
  let createFolderEventStub
  const emTransactionalStub = stub().callsArg(0)
  const emClearStub = stub()
  const emPersistStub = stub()
  const emRemoveStub = stub()
  const nodeServiceLoadNodesStub = stub()
  // const nodeRepositoryFindNodesStub = stub()
  const userFileServiceValidateProtectedSpacesStub = stub()
  const nodeServiceValidateEditableByStub = stub()
  const spaceServiceValidateVerificationSpaceStub = stub()
  const comparisonServiceValidateComparisonsStub = stub()
  const userFileServiceValidateSpaceReportsStub = stub()
  const nodeServiceMarkNodesAsRemovingStub = stub()
  const queueCreateRemoveNodesJobTaskStub = stub()
  const nodeServiceRollbackRemovingStateStub = stub()
  const userFileRepositoryCountStub = stub()
  const userRepositoryFindOneStub = stub()
  const licensedItemServiceRemoveItemLicensedForNodeStub = stub()
  const removeArchiveEntriesForNodeStub = stub()
  const taggingServiceRemoveTaggingsStub = stub()
  const validateAssetRemovalStub = stub()
  const userClientFileRemoveStub = stub()
  const spaceEventServiceCreateAndSendSpaceEventStub = stub()

  const createRemoveNodesFacade = () => {
    const em = {
      transactional: emTransactionalStub,
      clear: emClearStub,
      persist: emPersistStub,
      remove: emRemoveStub,
    } as unknown as SqlEntityManager
    const userRepository = {
      findOne: userRepositoryFindOneStub,
    } as unknown as UserRepository

    const userFileRepository = {
      count: userFileRepositoryCountStub,
    } as unknown as UserFileRepository
    const comparisonService = {
      validateComparisons: comparisonServiceValidateComparisonsStub,
    } as unknown as ComparisonService
    const userFileService = {
      validateProtectedSpaces: userFileServiceValidateProtectedSpacesStub,
      validateSpaceReports: userFileServiceValidateSpaceReportsStub,
      validateAssetRemoval: validateAssetRemovalStub,
    } as unknown as UserFileService
    const nodeService = {
      loadNodes: nodeServiceLoadNodesStub,
      validateEditableBy: nodeServiceValidateEditableByStub,
      markNodesAsRemoving: nodeServiceMarkNodesAsRemovingStub,
      rollbackRemovingState: nodeServiceRollbackRemovingStateStub,
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

    return new RemoveNodesFacade(
      em,
      userCtx,
      userRepository,
      userFileRepository,
      comparisonService,
      userFileService,
      nodeService,
      spaceService,
      taggingService,
      spaceEventService,
      licensedItemService,
      archiveEntryService,
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

    userFileServiceValidateProtectedSpacesStub.reset()
    userFileServiceValidateProtectedSpacesStub.throws()

    nodeServiceValidateEditableByStub.reset()
    nodeServiceValidateEditableByStub.throws()

    spaceServiceValidateVerificationSpaceStub.reset()
    spaceServiceValidateVerificationSpaceStub.throws()

    comparisonServiceValidateComparisonsStub.reset()
    comparisonServiceValidateComparisonsStub.throws()

    userFileServiceValidateSpaceReportsStub.reset()
    userFileServiceValidateSpaceReportsStub.throws()

    nodeServiceMarkNodesAsRemovingStub.reset()
    nodeServiceMarkNodesAsRemovingStub.throws()

    queueCreateRemoveNodesJobTaskStub.reset()
    queueCreateRemoveNodesJobTaskStub.throws()

    nodeServiceRollbackRemovingStateStub.reset()
    nodeServiceRollbackRemovingStateStub.throws()

    userFileRepositoryCountStub.reset()
    userFileRepositoryCountStub.throws()

    userRepositoryFindOneStub.reset()
    userRepositoryFindOneStub.throws()

    licensedItemServiceRemoveItemLicensedForNodeStub.reset()
    licensedItemServiceRemoveItemLicensedForNodeStub.throws()

    removeArchiveEntriesForNodeStub.reset()
    removeArchiveEntriesForNodeStub.throws()

    taggingServiceRemoveTaggingsStub.reset()
    taggingServiceRemoveTaggingsStub.throws()

    userClientFileRemoveStub.reset()
    userClientFileRemoveStub.throws()

    validateAssetRemovalStub.reset()
    validateAssetRemovalStub.throws()

    spaceEventServiceCreateAndSendSpaceEventStub.reset()
    spaceEventServiceCreateAndSendSpaceEventStub.throws()

    getNodePathStub = stub(userFileHelper, 'getNodePath')
    createFileEventStub = stub(eventHelper, 'createFileEvent')
    createFolderEventStub = stub(eventHelper, 'createFolderEvent')
  })

  afterEach(() => {
    getNodePathStub.restore()
    createFileEventStub.restore()
    createFolderEventStub.restore()
  })

  describe('#removeNodesAsync', () => {
    it('basic', async () => {
      const ids = [1, 2, 3]
      const node1 = { id: 1, stiType: FILE_STI_TYPE.USERFILE } as unknown as UserFile
      const node2 = { id: 2, stiType: FILE_STI_TYPE.ASSET } as unknown as UserFile
      const node3 = { id: 3, stiType: FILE_STI_TYPE.FOLDER } as unknown as Folder
      const nodes = [node1, node2, node3]

      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      userFileServiceValidateProtectedSpacesStub.reset()
      nodeServiceValidateEditableByStub.reset()
      spaceServiceValidateVerificationSpaceStub.reset()
      nodeServiceMarkNodesAsRemovingStub.reset()
      comparisonServiceValidateComparisonsStub.reset()
      userFileServiceValidateSpaceReportsStub.reset()
      removeArchiveEntriesForNodeStub.reset()
      queueCreateRemoveNodesJobTaskStub.reset()
      validateAssetRemovalStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      await removeNodesFacade.removeNodesAsync(ids)

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true
      expect(nodeServiceLoadNodesStub.calledWith({ ids }, {})).to.be.true

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true
      expect(nodeServiceLoadNodesStub.calledWith(ids)).to.be.true

      expect(userFileServiceValidateProtectedSpacesStub.calledThrice).to.be.true
      expect(userFileServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node1)).to.be
        .true
      expect(userFileServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node2)).to.be
        .true
      expect(userFileServiceValidateProtectedSpacesStub.calledWith('remove', USER_ID, node3)).to.be
        .true

      expect(nodeServiceValidateEditableByStub.calledThrice).to.be.true
      expect(nodeServiceValidateEditableByStub.calledWith(node1)).to.be.true
      expect(nodeServiceValidateEditableByStub.calledWith(node2)).to.be.true
      expect(nodeServiceValidateEditableByStub.calledWith(node3)).to.be.true

      expect(spaceServiceValidateVerificationSpaceStub.calledThrice).to.be.true
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node1)).to.be.true
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node2)).to.be.true
      expect(spaceServiceValidateVerificationSpaceStub.calledWith(node3)).to.be.true

      expect(comparisonServiceValidateComparisonsStub.calledTwice).to.be.true
      expect(comparisonServiceValidateComparisonsStub.calledWith(node1)).to.be.true
      expect(comparisonServiceValidateComparisonsStub.calledWith(node2)).to.be.true

      expect(userFileServiceValidateSpaceReportsStub.calledTwice).to.be.true
      expect(userFileServiceValidateSpaceReportsStub.calledWith(node1)).to.be.true
      expect(userFileServiceValidateSpaceReportsStub.calledWith(node2)).to.be.true

      expect(removeArchiveEntriesForNodeStub.calledOnce).to.be.true
      expect(removeArchiveEntriesForNodeStub.calledWith(node2.id)).to.be.true

      expect(nodeServiceMarkNodesAsRemovingStub.calledOnce).to.be.true
      expect(nodeServiceMarkNodesAsRemovingStub.calledWith(ids)).to.be.true

      expect(queueCreateRemoveNodesJobTaskStub.calledOnce).to.be.true
      expect(queueCreateRemoveNodesJobTaskStub.calledWith(ids, userCtx)).to.be.true

      expect(validateAssetRemovalStub.calledOnce).to.be.true
      expect(validateAssetRemovalStub.calledWith(node2)).to.be.true
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

      getNodePathStub.callsFake((em, node: Node) => {
        return `/path/to/${node.name}`
      })
      createFileEventStub.reset()
      createFolderEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).returns(2)
      userRepositoryFindOneStub.returns({ id: USER_ID })
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

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true
      expect(nodeServiceLoadNodesStub.calledWith(ids)).to.be.true

      expect(emClearStub.calledOnce).to.be.true

      expect(userFileRepositoryCountStub.calledTwice).to.be.true
      expect(userFileRepositoryCountStub.calledWith({ dxid: node1.dxid })).to.be.true
      expect(userFileRepositoryCountStub.calledWith({ dxid: node2.dxid })).to.be.true

      expect(getNodePathStub.calledTwice).to.be.true

      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledTwice).to.be.true
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node1.id)).to.be.true
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node2.id)).to.be.true

      expect(taggingServiceRemoveTaggingsStub.calledOnce).to.be.true

      expect(createFileEventStub.calledTwice).to.be.true
      expect(createFileEventStub.calledWith(node1, 'remove', USER_ID)).to.be.true

      expect(userClientFileRemoveStub.calledOnce).to.be.true
      expect(userClientFileRemoveStub.calledWith(node1.dxid)).to.be.true

      expect(spaceEventServiceCreateAndSendSpaceEventStub.calledOnce).to.be.true
      expect(
        spaceEventServiceCreateAndSendSpaceEventStub.calledWith({
          entity: { type: 'userFile', value: node1 },
          spaceId: node1.getSpaceId(),
          userId: USER_ID,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        }),
      )

      expect(emRemoveStub.calledTwice).to.be.true
      expect(emRemoveStub.calledWith(node1)).to.be.true
      expect(emRemoveStub.calledWith(node2)).to.be.true

      expect(emPersistStub.calledOnce).to.be.true

      expect(createFolderEventStub.calledOnce).to.be.true
      expect(
        createFolderEventStub.calledWith('folder_deleted', folder1, '/path/to/folder1', {
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

      getNodePathStub.callsFake((em, node: Node) => {
        return `/path/to/${node.name}`
      })
      createFileEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).returns(2)
      userRepositoryFindOneStub.returns({ id: USER_ID })
      licensedItemServiceRemoveItemLicensedForNodeStub.reset()
      taggingServiceRemoveTaggingsStub.reset()
      emPersistStub.reset()
      userClientFileRemoveStub.reset()
      userClientFileRemoveStub
        .withArgs({
          projectId: node1.project,
          ids: [node1.dxid],
        })
        .throws({ props: { clientStatusCode: 404 } })
      spaceEventServiceCreateAndSendSpaceEventStub.reset()
      emRemoveStub.reset()

      const removeNodesFacade = createRemoveNodesFacade()

      // validations are tested in the async case
      const result = await removeNodesFacade.removeNodes(ids, true)
      expect(result).to.deep.equal({ removedFilesCount: 2, removedFoldersCount: 0 })

      expect(nodeServiceLoadNodesStub.calledOnce).to.be.true
      expect(nodeServiceLoadNodesStub.calledWith(ids)).to.be.true

      expect(emClearStub.calledOnce).to.be.true

      expect(userFileRepositoryCountStub.calledTwice).to.be.true
      expect(userFileRepositoryCountStub.calledWith({ dxid: node1.dxid })).to.be.true
      expect(userFileRepositoryCountStub.calledWith({ dxid: node2.dxid })).to.be.true

      expect(getNodePathStub.calledTwice).to.be.true

      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledTwice).to.be.true
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node1.id)).to.be.true
      expect(licensedItemServiceRemoveItemLicensedForNodeStub.calledWith(node2.id)).to.be.true

      expect(taggingServiceRemoveTaggingsStub.calledOnce).to.be.true

      expect(createFileEventStub.calledTwice).to.be.true
      expect(createFileEventStub.calledWith(node1, 'remove', USER_ID)).to.be.true

      expect(userClientFileRemoveStub.calledOnce).to.be.true
      expect(userClientFileRemoveStub.calledWith(node1.dxid)).to.be.true

      expect(spaceEventServiceCreateAndSendSpaceEventStub.calledOnce).to.be.true
      expect(
        spaceEventServiceCreateAndSendSpaceEventStub.calledWith({
          entity: { type: 'userFile', value: node1 },
          spaceId: node1.getSpaceId(),
          userId: USER_ID,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        }),
      )

      expect(emRemoveStub.calledTwice).to.be.true
      expect(emRemoveStub.calledWith(node1)).to.be.true
      expect(emRemoveStub.calledWith(node2)).to.be.true

      expect(emPersistStub.calledOnce).to.be.true
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

      getNodePathStub.callsFake((em, node: Node) => {
        return `/path/to/${node.name}`
      })
      createFileEventStub.reset()
      nodeServiceLoadNodesStub.withArgs(ids).returns(nodes)
      emClearStub.reset()
      userFileRepositoryCountStub.withArgs({ dxid: node1.dxid }).returns(1)
      // simulate any kind of error
      userFileRepositoryCountStub.withArgs({ dxid: node2.dxid }).throws(new Error('Error'))
      userRepositoryFindOneStub.returns({ id: USER_ID })
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

      expect(nodeServiceRollbackRemovingStateStub.calledOnce).to.be.true
      expect(nodeServiceRollbackRemovingStateStub.calledWith([node2, node3])).to.be.true
    })
  })
})
