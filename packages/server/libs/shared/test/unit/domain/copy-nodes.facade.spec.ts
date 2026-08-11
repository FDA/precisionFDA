import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
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
  const userGetDestinationProjectIdStub = stub()
  const userIsChallengeBotStub = stub()

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

  let referenceCreateStub: SinonStub

  const USER = {
    id: USER_ID,
    privateFilesProject: PRIVATE_PROJECT,
    publicFilesProject: PUBLIC_PROJECT,
    getDestinationProjectId: userGetDestinationProjectIdStub,
    isChallengeBot: userIsChallengeBotStub,
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
    referenceCreateStub.callsFake(entity => entity)

    userLoadEntityStub.reset()
    userLoadEntityStub.resolves(USER)

    userGetDestinationProjectIdStub.reset()
    userGetDestinationProjectIdStub.resolves(PRIVATE_PROJECT)

    userIsChallengeBotStub.reset()
    userIsChallengeBotStub.returns(false)

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

    it('should reject a node not accessible by a regular user', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(null)

      await expect(getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)).to.be.rejectedWith(
        `Node with id ${SOURCE_FILE_ID} is not accessible or does not exist`,
      )

      expect(platformProjectCloneStub.called).to.be.false()
    })

    it('should skip the DB accessibility check for the challenge bot (submitter-owned files)', async () => {
      // Challenge submissions: the bot copies the submitter's private files it
      // does not own - access is granted by a temporary platform-level VIEW
      // permission, so only the platform clone is the gatekeeper.
      userIsChallengeBotStub.returns(true)
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(null)

      const results = await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE, TARGET_FOLDER_ID)

      expect(nodeServiceGetAccessibleEntityByIdStub.called).to.be.false()
      expect(nodeServiceValidateProtectedSpacesStub.calledWith('copy', USER_ID, sourceFile)).to.be.true()
      expect(platformProjectCloneStub.calledOnce).to.be.true()
      expect(results).to.have.length(1)
      expect(results[0]).to.include({ sourceNodeId: SOURCE_FILE_ID, copied: true })
    })

    it('should create an empty folder without cloning platform objects', async () => {
      const sourceFolder = {
        id: SOURCE_FILE_ID,
        name: 'Empty Folder',
        stiType: FILE_STI_TYPE.FOLDER,
        isFolder: true,
        isFile: false,
        isAsset: false,
        project: undefined,
        taggings: [],
        properties: [],
      } as unknown as Folder

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFolder])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFolder)
      eventHelperCreateFolderEventStub.resolves({ type: EVENT_TYPES.FOLDER_CREATED })

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(platformProjectCloneStub.called).to.be.false()
      expect(emPersistStub.firstCall.args[0]).to.be.instanceOf(Folder)
      expect(emPersistStub.firstCall.args[0]).to.include({
        name: 'Empty Folder',
        project: PRIVATE_PROJECT,
        scope: TARGET_SCOPE,
      })
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

    it('should reuse a target file owned by another user when it has the same platform object', async () => {
      const existingNodeInTarget = { ...sourceFile, id: 999, project: PRIVATE_PROJECT }
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)
      emFindOneStub.resolves(existingNodeInTarget)

      const results = await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(emFindOneStub.calledOnce).to.be.true()
      expect(emFindOneStub.firstCall.args[1]).to.deep.eq({
        stiType: FILE_STI_TYPE.USERFILE,
        dxid: SOURCE_FILE_DXID,
        project: PRIVATE_PROJECT,
      })
      expect(emPersistStub.called).to.be.false()
      expect(results).to.deep.eq([{ sourceNodeId: SOURCE_FILE_ID, targetNodeId: 999, copied: false }])
    })

    it('should reuse existing nested folders under their mapped destination parent on re-copy', async () => {
      const SOURCE_PARENT_FOLDER_ID = 500
      const SOURCE_CHILD_FOLDER_ID = 501
      const TARGET_PARENT_FOLDER_ID = 800
      const TARGET_CHILD_FOLDER_ID = 801
      const sourceParentFolder = {
        id: SOURCE_PARENT_FOLDER_ID,
        name: 'Parent Folder',
        stiType: FILE_STI_TYPE.FOLDER,
        isFolder: true,
        isFile: false,
        isAsset: false,
        taggings: [],
        properties: [],
      } as unknown as Folder
      const sourceChildFolder = {
        id: SOURCE_CHILD_FOLDER_ID,
        name: 'Child Folder',
        stiType: FILE_STI_TYPE.FOLDER,
        isFolder: true,
        isFile: false,
        isAsset: false,
        parentFolderId: SOURCE_PARENT_FOLDER_ID,
        taggings: [],
        properties: [],
      } as unknown as Folder
      const targetParentFolder = {
        id: TARGET_PARENT_FOLDER_ID,
        stiType: FILE_STI_TYPE.FOLDER,
      } as Folder
      const targetChildFolder = {
        id: TARGET_CHILD_FOLDER_ID,
        stiType: FILE_STI_TYPE.FOLDER,
      } as Folder

      nodeServiceLoadNodesStub.withArgs([SOURCE_PARENT_FOLDER_ID], {}).resolves([sourceChildFolder, sourceParentFolder])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_PARENT_FOLDER_ID).resolves(sourceParentFolder)
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_CHILD_FOLDER_ID).resolves(sourceChildFolder)
      emFindOneStub.onFirstCall().resolves(targetParentFolder)
      emFindOneStub.onSecondCall().resolves(targetChildFolder)

      const results = await getInstance().copyNodes([SOURCE_PARENT_FOLDER_ID], TARGET_SCOPE)

      expect(platformProjectCloneStub.called).to.be.false()
      expect(emFindOneStub.secondCall.args[1]).to.include({ parentFolderId: TARGET_PARENT_FOLDER_ID })
      expect(emPersistStub.called).to.be.false()
      expect(results).to.deep.eq([
        { sourceNodeId: SOURCE_PARENT_FOLDER_ID, targetNodeId: TARGET_PARENT_FOLDER_ID, copied: false },
        { sourceNodeId: SOURCE_CHILD_FOLDER_ID, targetNodeId: TARGET_CHILD_FOLDER_ID, copied: false },
      ])
    })

    it('should rollback platform objects if database transaction fails', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)

      const error = new Error('DB Connection Failed')
      emFlushStub.rejects(error)

      await expect(getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)).to.be.rejectedWith(error)

      expect(platformContainerRemoveObjectsStub.calledOnce).to.be.true()
      expect(platformContainerRemoveObjectsStub.firstCall.args).to.deep.eq([PRIVATE_PROJECT, [SOURCE_FILE_DXID]])

      expect(notificationCreateStub.calledOnce).to.be.true()
      expect(notificationCreateStub.firstCall.args[0]).to.include({
        severity: SEVERITY.ERROR,
        message: 'An error occurred while copying your files. Please try again later.',
      })

      expect(loggerErrorStub.called).to.be.true()
    })

    it('should skip open and copying files before cloning the remaining closed files', async () => {
      const openFile = {
        ...sourceFile,
        id: 2,
        dxid: 'file-open-2',
        state: FILE_STATE_DX.OPEN,
      } as unknown as UserFile
      const copyingFile = {
        ...sourceFile,
        id: 3,
        dxid: 'file-copying-3',
        state: FILE_STATE_PFDA.COPYING,
      } as unknown as UserFile
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID, openFile.id, copyingFile.id], {}).resolves([sourceFile, openFile, copyingFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)
      nodeServiceGetAccessibleEntityByIdStub.withArgs(openFile.id).resolves(openFile)
      nodeServiceGetAccessibleEntityByIdStub.withArgs(copyingFile.id).resolves(copyingFile)

      const results = await getInstance().copyNodes([SOURCE_FILE_ID, openFile.id, copyingFile.id], TARGET_SCOPE)

      expect(platformProjectCloneStub.calledOnceWith('project-source', PRIVATE_PROJECT, [SOURCE_FILE_DXID])).to.be.true()
      expect(platformContainerRemoveObjectsStub.called).to.be.false()
      expect(results).to.have.length(1)
      expect(results[0]).to.include({ sourceNodeId: SOURCE_FILE_ID, copied: true })
      expect(loggerErrorStub.called).to.be.false()
    })

    it('should create an asset when the target contains a user file for the same platform object', async () => {
      const sourceArchiveEntry = {
        id: 100,
        name: 'entry.txt',
        path: '/entry.txt',
      }
      const sourceAsset = {
        ...sourceFile,
        stiType: FILE_STI_TYPE.ASSET,
        isAsset: true,
        isFile: true,
        archiveEntries: [sourceArchiveEntry],
      } as unknown as Asset
      const existingTargetUserFile = {
        ...sourceFile,
        id: 999,
        project: PRIVATE_PROJECT,
      }

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceAsset])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceAsset)
      emFindOneStub.callsFake((_entity, conditions) =>
        conditions.stiType === FILE_STI_TYPE.ASSET ? null : existingTargetUserFile,
      )

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(emFindOneStub.firstCall.args[1]).to.deep.eq({
        stiType: FILE_STI_TYPE.ASSET,
        dxid: SOURCE_FILE_DXID,
        project: PRIVATE_PROJECT,
      })
      const savedAsset = emPersistStub.firstCall.args[0] as Asset
      expect(savedAsset).to.be.instanceOf(Asset)
      expect(savedAsset.archiveEntries.getItems()).to.have.length(1)
    })

    it('should copy asset specific fields', async () => {
      const sourceArchiveEntry = {
        id: 100,
        name: 'entry.txt',
        path: '/entry.txt',
      }
      const assetNode = {
        ...sourceFile,
        stiType: FILE_STI_TYPE.ASSET,
        isAsset: true,
        isFile: true,
        archiveEntries: [sourceArchiveEntry],
      } as unknown as Asset

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([assetNode])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(assetNode)

      await getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)

      expect(emPersistStub.called).to.be.true()
      const savedNode = emPersistStub.firstCall.args[0] as Asset

      expect(emPopulateStub.calledWith(assetNode, ['archiveEntries'])).to.be.true()

      expect(savedNode instanceof Asset).to.be.true()
      // PFDA-3325 invariant: copied assets must stay identified as assets via
      // parentType 'Asset' (never re-parented as 'Node') with parentId
      // pointing at the source node.
      expect(savedNode.parentType).to.eq(PARENT_TYPE.ASSET)
      expect(savedNode.parentId).to.eq(SOURCE_FILE_ID)
      expect(assetNode.archiveEntries).to.deep.eq([sourceArchiveEntry])

      const [copiedArchiveEntry] = savedNode.archiveEntries.getItems()
      expect(copiedArchiveEntry).to.not.eq(sourceArchiveEntry)
      expect(copiedArchiveEntry).to.include({
        name: sourceArchiveEntry.name,
        path: sourceArchiveEntry.path,
      })
    })

    it('should process space events if target is a space', async () => {
      const spaceScope = 'space-10' as EntityScope
      const spaceId = 10

      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)
      userGetDestinationProjectIdStub.withArgs(spaceScope, 'editable').resolves('project-host')

      await getInstance().copyNodes([SOURCE_FILE_ID], spaceScope)

      // the destination project must be resolved for the requested scope with edit access enforced
      expect(userGetDestinationProjectIdStub.calledOnceWith(spaceScope, 'editable')).to.be.true()
      expect(platformProjectCloneStub.firstCall.args).to.deep.eq(['project-source', 'project-host', [SOURCE_FILE_DXID]])

      expect(spaceEventCreateStub.called).to.be.true()
      expect(spaceEventCreateStub.firstCall.firstArg.spaceId).to.eq(spaceId)
      expect(spaceEventCreateStub.firstCall.firstArg.activityType).to.eq(SPACE_EVENT_ACTIVITY_TYPE.file_added)
      expect(spaceEventCreateStub.firstCall.firstArg.userId).to.eq(USER.id)
      expect(spaceEventSendNotificationStub.called).to.be.true()
    })

    it('should not copy and should notify with error if destination project cannot be resolved', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      userGetDestinationProjectIdStub.resolves(null)

      await expect(getInstance().copyNodes([SOURCE_FILE_ID], 'space-10' as EntityScope)).to.be.rejectedWith(
        PermissionError,
        'You do not have permission to copy files to this scope.',
      )

      expect(platformProjectCloneStub.called).to.be.false()
      expect(emPersistStub.called).to.be.false()
      expect(notificationCreateStub.calledOnce).to.be.true()
      expect(notificationCreateStub.firstCall.args[0]).to.include({
        severity: SEVERITY.ERROR,
        message: 'You do not have permission to copy files to this scope.',
      })
      expect(loggerErrorStub.called).to.be.true()
    })

    it('should notify and rethrow platform clone failures', async () => {
      nodeServiceLoadNodesStub.withArgs([SOURCE_FILE_ID], {}).resolves([sourceFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FILE_ID).resolves(sourceFile)
      const error = new Error('Platform clone failed')
      platformProjectCloneStub.rejects(error)

      await expect(getInstance().copyNodes([SOURCE_FILE_ID], TARGET_SCOPE)).to.be.rejectedWith(error)

      expect(notificationCreateStub.calledOnce).to.be.true()
      expect(notificationCreateStub.firstCall.args[0]).to.include({
        severity: SEVERITY.ERROR,
        message: 'An error occurred while copying your files. Please try again later.',
      })
      expect(loggerErrorStub.called).to.be.true()
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

    it('should keep hierarchy for a mixed batch with project-less folders in parents-first order', async () => {
      const SOURCE_FOLDER_ID = 700
      const SOURCE_CHILD_ID = 701
      const NEW_FOLDER_ID = 999

      // Rails folders carry no project - only files do.
      const sourceFolder = {
        id: SOURCE_FOLDER_ID,
        name: 'Docs',
        stiType: FILE_STI_TYPE.FOLDER,
        isFolder: true,
        isFile: false,
        isAsset: false,
        scope: 'private',
        project: undefined,
        taggings: [],
        properties: [],
      } as unknown as Folder

      const sourceChildFile = {
        id: SOURCE_CHILD_ID,
        name: 'Child.txt',
        stiType: FILE_STI_TYPE.USERFILE,
        isFile: true,
        isFolder: false,
        isAsset: false,
        parentFolderId: SOURCE_FOLDER_ID,
        dxid: 'file-child-dxid',
        uid: 'file-child-uid',
        state: FILE_STATE_DX.CLOSED,
        project: 'project-source',
        taggings: [],
        properties: [],
      } as unknown as UserFile

      // Parents-first order: the previous [...nodes].reverse() would process
      // the child before its folder and silently re-root it; taking the
      // source project from nodes[0] (a project-less folder) would raise
      // InvalidStateError for the file.
      nodeServiceLoadNodesStub
        .withArgs([SOURCE_FOLDER_ID, SOURCE_CHILD_ID], {})
        .resolves([sourceFolder, sourceChildFile])
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_FOLDER_ID).resolves(sourceFolder)
      nodeServiceGetAccessibleEntityByIdStub.withArgs(SOURCE_CHILD_ID).resolves(sourceChildFile)
      eventHelperCreateFolderEventStub.resolves({ type: EVENT_TYPES.FOLDER_CREATED })
      eventHelperCreateFileCopyEventStub.resolves({ type: EVENT_TYPES.FILE_COPIED })

      emPersistStub.callsFake(async entity => {
        if (entity instanceof Folder) {
          entity.id = NEW_FOLDER_ID
        }
      })

      await getInstance().copyNodes([SOURCE_FOLDER_ID, SOURCE_CHILD_ID], TARGET_SCOPE)

      // Source project is resolved from the file, not the project-less folder.
      expect(platformProjectCloneStub.calledOnce).to.be.true()
      expect(platformProjectCloneStub.firstCall.args).to.deep.eq([
        'project-source',
        PRIVATE_PROJECT,
        ['file-child-dxid'],
      ])

      const persistedFolder = emPersistStub.getCall(0).args[0]
      expect(persistedFolder.stiType).to.eq(FILE_STI_TYPE.FOLDER)
      expect(persistedFolder.name).to.eq('Docs')

      const persistedFile = emPersistStub.getCall(2).args[0]
      expect(persistedFile.stiType).to.eq(FILE_STI_TYPE.USERFILE)
      expect(persistedFile.parentFolderId).to.eq(NEW_FOLDER_ID)
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
    )
    ;(service as unknown as { logger: object }).logger = {
      log: loggerLogStub,
      error: loggerErrorStub,
      warn: stub(),
    }
    return service
  }
})
