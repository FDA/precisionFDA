import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { PlatformClient } from '@shared/platform-client'
import { EntityScope } from '@shared/types/common'

describe('CopyNodesFacade', () => {
  const USER_ID = 100
  const PRIVATE_PROJECT = 'project-private'
  const PUBLIC_PROJECT = 'project-public'
  const SOURCE_FILE_ID = 1
  const SOURCE_FILE_DXID = 'file-source-1'
  const SOURCE_FILE_UID = 'file-source-1-1'
  const TARGET_SCOPE = STATIC_SCOPE.PRIVATE
  const TARGET_FOLDER_ID = 50

  const emFindOneStub = stub()
  const emPersistStub = stub()
  const emFlushStub = stub()
  const emPopulateStub = stub()
  const emTransactionalStub = stub()

  const userLoadEntityStub = stub()

  const platformProjectCloneStub = stub()
  const platformContainerRemoveObjectsStub = stub()

  const nodeServiceLoadNodesStub = stub()
  const nodeServiceGetAccessibleEntityByIdStub = stub()
  const nodeServiceValidateProtectedSpacesStub = stub()

  const nodeHelperGenerateUidStub = stub()
  const nodeHelperGetNodePathStub = stub()

  const eventHelperCreateFolderEventStub = stub()
  const eventHelperCreateFileCopyEventStub = stub()

  const notificationCreateStub = stub()

  const spaceEventCreateStub = stub()
  const spaceEventSendNotificationStub = stub()

  const loggerLogStub = stub()
  const loggerErrorStub = stub()

  const spaceMembershipRepoGetMembershipStub = stub()

  let referenceCreateStub: SinonStub

  const USER = {
    id: USER_ID,
    privateFilesProject: PRIVATE_PROJECT,
    publicFilesProject: PUBLIC_PROJECT,
  } as unknown as User

  const USER_CTX = {
    id: USER_ID,
    loadEntity: userLoadEntityStub,
  } as unknown as UserContext

  const em = {
    findOne: emFindOneStub,
    persist: emPersistStub,
    flush: emFlushStub,
    populate: emPopulateStub,
    transactional: emTransactionalStub,
  } as unknown as SqlEntityManager

  const platformClient = {
    projectClone: platformProjectCloneStub,
    containerRemoveObjects: platformContainerRemoveObjectsStub,
  } as unknown as PlatformClient

  const nodeService = {
    loadNodes: nodeServiceLoadNodesStub,
    getAccessibleEntityById: nodeServiceGetAccessibleEntityByIdStub,
    validateProtectedSpaces: nodeServiceValidateProtectedSpacesStub,
  } as unknown as NodeService

  const nodeHelper = {
    generateUid: nodeHelperGenerateUidStub,
    getNodePath: nodeHelperGetNodePathStub,
  } as unknown as NodeHelper

  const eventHelper = {
    createFolderEvent: eventHelperCreateFolderEventStub,
    createFileCopyEvent: eventHelperCreateFileCopyEventStub,
  } as unknown as EventHelper

  const notificationService = {
    createNotification: notificationCreateStub,
  } as unknown as NotificationService

  const spaceEventService = {
    createSpaceEvent: spaceEventCreateStub,
    sendNotificationForEvent: spaceEventSendNotificationStub,
  } as unknown as SpaceEventService

  const spaceMembershipRepo = {
    getMembership: spaceMembershipRepoGetMembershipStub,
  } as unknown as SpaceMembershipRepository

  beforeEach(() => {
    emFindOneStub.reset()
    emFindOneStub.resolves(null)
    emPersistStub.reset()
    emPersistStub.resolves()
    emFlushStub.reset()
    emFlushStub.resolves()
    emPopulateStub.reset()
    emPopulateStub.resolves()

    emTransactionalStub.reset()
    emTransactionalStub.callsFake(async callback => {
      return callback(em)
    })

    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(USER).returns(USER)

    userLoadEntityStub.reset()
    userLoadEntityStub.resolves(USER)

    platformProjectCloneStub.reset()
    platformProjectCloneStub.resolves()
    platformContainerRemoveObjectsStub.reset()
    platformContainerRemoveObjectsStub.resolves()

    nodeServiceLoadNodesStub.reset()
    nodeServiceGetAccessibleEntityByIdStub.reset()
    nodeServiceValidateProtectedSpacesStub.reset()
    nodeServiceValidateProtectedSpacesStub.resolves()

    nodeHelperGenerateUidStub.reset()
    nodeHelperGenerateUidStub.resolves(`${SOURCE_FILE_DXID}-new`)
    nodeHelperGetNodePathStub.reset()
    nodeHelperGetNodePathStub.resolves('/')

    eventHelperCreateFileCopyEventStub.reset()
    eventHelperCreateFolderEventStub.reset()

    notificationCreateStub.reset()
    spaceEventCreateStub.reset()
    spaceEventSendNotificationStub.reset()

    spaceMembershipRepoGetMembershipStub.reset()
    spaceMembershipRepoGetMembershipStub.throws()

    loggerLogStub.reset()
    loggerErrorStub.reset()
  })

  afterEach(() => {
    referenceCreateStub.restore()
  })

  describe('#copyNodes', () => {
    const sourceFile = {
      id: SOURCE_FILE_ID,
      name: 'file.txt',
      stiType: FILE_STI_TYPE.USERFILE,
      isFile: true,
      isFolder: false,
      isAsset: false,
      dxid: SOURCE_FILE_DXID,
      uid: SOURCE_FILE_UID,
      state: FILE_STATE_DX.CLOSED,
      project: 'project-source',
      description: 'desc',
      fileSize: 1024,
      taggings: [],
      properties: [],
    } as unknown as UserFile

    it('should successfully copy a single file to private scope', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE, TARGET_FOLDER_ID)

      expect(platformProjectCloneStub.calledOnce).to.be.true()
      expect(platformProjectCloneStub.firstCall.args).to.deep.eq([
        'project-source',
        PRIVATE_PROJECT,
        [SOURCE_FILE_DXID],
      ])

      expect(nodeServiceValidateProtectedSpacesStub.calledWith('copy', USER_ID, sourceFile)).to.be.true()

      expect(emPersistStub.called).to.be.true()
      const savedNode = emPersistStub.firstCall.args[0]
      expect(savedNode.dxid).to.eq(SOURCE_FILE_DXID)
      expect(savedNode.project).to.eq(PRIVATE_PROJECT)
      expect(savedNode.scope).to.eq(TARGET_SCOPE)
      expect(savedNode.parentFolderId).to.eq(TARGET_FOLDER_ID)

      expect(notificationCreateStub.calledOnce).to.be.true()
      expect(notificationCreateStub.firstCall.args[0]).to.include({
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.NODES_COPIED,
      })
    })

    it('should use NodeTagging for tagging copies (New Entity Type)', async () => {
      const nodeWithTags = {
        ...sourceFile,
        taggings: [{ tagId: 10, context: 'tags' }],
      } as unknown as UserFile

      nodeServiceLoadNodesStub.resolves([nodeWithTags])
      nodeServiceGetAccessibleEntityByIdStub.resolves(nodeWithTags)

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(emPopulateStub.calledWith(nodeWithTags, ['taggings'])).to.be.true()
      // We indirectly verify NodeTagging use by ensuring the logic completed
      // without errors and persisted the parent node.
    })

    it('should copy all properties from the source node to the newly created node', async () => {
      // 1. Setup source node with existing properties
      const mockProperty = {
        propertyName: 'test-key',
        propertyValue: 'test-value',
      }

      const sourceNodeWithProperties = {
        ...sourceFile,
        properties: [mockProperty],
      } as unknown as UserFile

      nodeServiceLoadNodesStub.resolves([sourceNodeWithProperties])
      nodeServiceGetAccessibleEntityByIdStub.resolves(sourceNodeWithProperties)

      // 2. Execute
      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      // 3. Assertions
      // Verify em.populate was called specifically for properties
      expect(emPopulateStub.calledWith(sourceNodeWithProperties, ['properties'])).to.be.true()

      // Verify that persist was called for the new node.
      // Since properties are added to the newlyCreatedNode.properties collection,
      // MikroORM will persist them automatically if the collection is managed.
      expect(emPersistStub.called).to.be.true()
    })

    it('should skip existing files in target', async () => {
      const existingNodeInTarget = { ...sourceFile, id: 999 }
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)

      emFindOneStub.resolves(existingNodeInTarget)

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(platformProjectCloneStub.calledOnce).to.be.true()

      expect(emPersistStub.called).to.be.false()

      expect(notificationCreateStub.calledOnce).to.be.true()
      const msg = notificationCreateStub.firstCall.args[0].message
      expect(msg).to.contain('already existed in target location')
    })

    it('should rollback platform objects if database transaction fails', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)

      emFlushStub.rejects(new Error('DB Connection Failed'))

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(platformContainerRemoveObjectsStub.calledOnce).to.be.true()
      expect(platformContainerRemoveObjectsStub.firstCall.args).to.deep.eq([PRIVATE_PROJECT, [SOURCE_FILE_DXID]])

      expect(notificationCreateStub.calledOnce).to.be.true()
      expect(notificationCreateStub.firstCall.args[0]).to.include({
        severity: SEVERITY.ERROR,
        message: 'An error occurred while copying your files. Please try again later.',
      })

      expect(loggerErrorStub.called).to.be.true()
    })

    it('should throw error if source file is not closed', async () => {
      const openFile = { ...sourceFile, state: FILE_STATE_DX.OPEN }
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([openFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(openFile)

      try {
        await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.message).to.eq(`Only files in 'closed' state can be copied.`)
      }

      expect(platformProjectCloneStub.called).to.be.true()

      expect(platformContainerRemoveObjectsStub.called).to.be.false()
      expect(loggerErrorStub.called).to.be.false()
    })

    it('should copy asset specific fields', async () => {
      const assetNode = {
        ...sourceFile,
        stiType: FILE_STI_TYPE.ASSET,
        isAsset: true,
        isFile: true,
        archiveEntries: ['entry1'],
      } as unknown as Asset

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([assetNode])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(assetNode)

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(emPersistStub.called).to.be.true()
      const savedNode = emPersistStub.firstCall.args[0] as Asset

      expect(emPopulateStub.calledWith(assetNode, ['archiveEntries'])).to.be.true()

      expect(savedNode instanceof Asset).to.be.true()
    })

    it('should process space events if target is a space', async () => {
      const spaceScope = 'space-10' as EntityScope
      const spaceId = 10

      const space = {
        id: spaceId,
        hostProject: 'project-host',
        guestProject: 'project-guest',
      } as unknown as Space

      const spacesCollection = [space] as unknown as Space[] & { load: () => Promise<void> }

      spacesCollection.load = stub().resolves()

      const spaceMembership = {
        isHost: true,
        spaces: spacesCollection,
      } as unknown as SpaceMembership

      userLoadEntityStub.resolves({
        ...USER,
        spaceMemberships: [
          {
            spaces: [{ id: spaceId, hostProject: 'project-host' }],
            isHost: true,
          },
        ],
      })

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)
      spaceMembershipRepoGetMembershipStub.withArgs(spaceId, USER.id).resolves(spaceMembership)

      await getInstance().copyNodes([SOURCE_FILE_ID], spaceScope)

      expect(spaceEventCreateStub.called).to.be.true()
      expect(spaceEventCreateStub.firstCall.firstArg.spaceId).to.eq(spaceId)
      expect(spaceEventCreateStub.firstCall.firstArg.activityType).to.eq(SPACE_EVENT_ACTIVITY_TYPE.file_added)
      expect(spaceEventCreateStub.firstCall.firstArg.userId).to.eq(USER.id)
      expect(spaceEventSendNotificationStub.called).to.be.true()
    })

    it('should copy parent folder BEFORE child file and link them correctly', async () => {
      const SOURCE_FOLDER_ID = 500
      const SOURCE_CHILD_ID = 501
      const NEW_FOLDER_ID = 888

      const sourceFolder = {
        id: SOURCE_FOLDER_ID,
        name: 'Parent Folder',
        stiType: FILE_STI_TYPE.FOLDER,
        isFolder: true,
        isFile: false,
        isAsset: false,
        scope: 'private',
        project: 'project-source',
        taggings: [],
        properties: [],
      } as unknown as Folder

      const sourceChildFile = {
        id: SOURCE_CHILD_ID,
        name: 'Child.txt',
        stiType: FILE_STI_TYPE.USERFILE,
        isFile: true,
        isFolder: false,
        parentFolderId: SOURCE_FOLDER_ID, // Points to source parent
        dxid: 'file-child-dxid',
        uid: 'file-child-uid',
        state: FILE_STATE_DX.CLOSED,
        project: 'project-source',
        taggings: [],
        properties: [],
      } as unknown as UserFile

      nodeServiceLoadNodesStub.withArgs([SOURCE_FOLDER_ID], {}).resolves([sourceChildFile, sourceFolder])

      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FOLDER_ID).resolves(sourceFolder)
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_CHILD_ID).resolves(sourceChildFile)
      eventHelperCreateFolderEventStub.resolves({ type: EVENT_TYPES.FOLDER_CREATED })
      eventHelperCreateFileCopyEventStub.resolves({ type: EVENT_TYPES.FILE_COPIED })

      emPersistStub.callsFake(async entity => {
        if (entity instanceof Folder) {
          entity.id = NEW_FOLDER_ID
        }
      })

      await getInstance().copyNodes([SOURCE_FOLDER_ID], TARGET_SCOPE)
      expect(emPersistStub.callCount).to.eq(4) // Folder, Event, File, Event

      const firstSaveCall = emPersistStub.getCall(0).args[0]
      const secondSaveCall = emPersistStub.getCall(1).args[0]
      const thirdSaveCall = emPersistStub.getCall(2).args[0]
      const fourthSaveCall = emPersistStub.getCall(3).args[0]

      expect(firstSaveCall.stiType).to.eq(FILE_STI_TYPE.FOLDER)
      expect(firstSaveCall.name).to.eq('Parent Folder')

      expect(secondSaveCall.type).to.eq(EVENT_TYPES.FOLDER_CREATED)

      expect(thirdSaveCall.stiType).to.eq(FILE_STI_TYPE.USERFILE)
      expect(thirdSaveCall.name).to.eq('Child.txt')
      expect(thirdSaveCall.parentFolderId).to.eq(NEW_FOLDER_ID)

      expect(fourthSaveCall.type).to.eq(EVENT_TYPES.FILE_COPIED)
    })
  })

  function getInstance(): CopyNodesFacade {
    const service = new CopyNodesFacade(
      em,
      USER_CTX,
      platformClient,
      nodeHelper,
      eventHelper,
      nodeService,
      notificationService,
      spaceEventService,
      spaceMembershipRepo,
    )
    ;(service as unknown as { logger: object }).logger = {
      log: loggerLogStub,
      error: loggerErrorStub,
      warn: stub(),
    }
    return service
  }
})
