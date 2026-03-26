import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import {
  FILE_STATE_DX,
  FILE_STI_TYPE,
  PARENT_TYPE,
  SelectedFile,
} from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { ASSET_VALIDATION_ERROR, PermissionError, ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import * as queue from '@shared/queue'
import { expect } from 'chai'
import sinon, { SinonStub, match, stub } from 'sinon'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Organization } from '@shared/domain/org/organization.entity'

describe('UserFileService', () => {
  const USER_ID = 0

  const PARENT_ID = 10
  const FILE_PARENT_TYPE = PARENT_TYPE.USER
  const PARENT_FOLDER_ID = 20
  const SCOPED_PARENT_FOLDER_ID = 30
  const FILE_SCOPE = STATIC_SCOPE.PRIVATE
  const DESCRIPTION = 'description'
  const STATE = FILE_STATE_DX.OPEN
  const PROJECT = 'project'
  const DXID = 'file-dxid'
  const UID = `${DXID}-1`
  const NAME = 'name'

  const FILE_CREATE: UserFileCreate = {
    scopedParentFolderId: SCOPED_PARENT_FOLDER_ID,
    parentFolderId: PARENT_FOLDER_ID,
    scope: FILE_SCOPE,
    parentType: FILE_PARENT_TYPE,
    description: DESCRIPTION,
    state: STATE,
    project: PROJECT,
    dxid: DXID,
    userId: USER_ID,
    name: NAME,
    parentId: PARENT_ID,
  }

  const getReferenceStub = stub()
  const persistAndFlushStub = stub()
  const persistStub = stub()
  const flushStub = stub()
  const removeStub = stub()
  const clearStub = stub()

  const userRepoFindOneOrFailStub = stub()
  const fileRepoFindOneOrFailStub = stub()
  const fileRepoFindOneStub = stub()
  const fileRepoCountStub = stub()
  const fileLoadIfAccessibleByUserStub = stub()
  const folderRepoFindOneStub = stub()
  const nodeRepoFindOneOrFailStub = stub()

  const isSiteAdminStub = stub()
  const isChallengeAdminStub = stub()

  const getWarningsForUnclosedFilesStub = stub()
  const sanitizeNodeNamesStub = stub()
  const renameDuplicateFilesStub = stub()

  const getLicenseItemsForNodeStub = stub()

  const createAndSendSpaceEventStub = stub()

  const fileDownloadLinkStub = stub()
  const fileDescribeStub = stub()
  const fileRemoveStub = stub()
  const userClientFileCloseStub = stub()
  const challengeBotClientFileCloseStub = stub()

  const spaceFindOneStub = stub()

  const removeTaggingsStub = stub()

  const createSpaceEventStub = stub()
  const emFindOneStub = stub()
  const emFindStub = stub()
  const emCountStub = stub()
  const emPopulateStub = stub()
  const emFindOneOrFailStub = stub()

  let createFileSynchronizeJobTaskStub: SinonStub
  let referenceCreateStub: SinonStub

  const userClient = {
    fileDownloadLink: fileDownloadLinkStub,
    fileDescribe: fileDescribeStub,
    fileRemove: fileRemoveStub,
    fileClose: userClientFileCloseStub,
  } as unknown as PlatformClient

  const challengeBotFileDescribeStub = stub()
  const challengeBotClient = {
    fileDescribe: challengeBotFileDescribeStub,
    fileClose: challengeBotClientFileCloseStub,
  } as unknown as PlatformClient

  const createNotificationStub = stub()
  const notificationService = {
    createNotification: createNotificationStub,
  } as unknown as NotificationService

  const nodeHelperGetNodePathStub = stub()
  const nodeHelperGetParentFolderStub = stub()
  const nodeHelperCollectChildrenStub = stub()
  const nodeHelper = {
    getNodePath: nodeHelperGetNodePathStub,
    getWarningsForUnclosedFiles: getWarningsForUnclosedFilesStub,
    sanitizeNodeNames: sanitizeNodeNamesStub,
    renameDuplicateFiles: renameDuplicateFilesStub,
    getParentFolder: nodeHelperGetParentFolderStub,
    collectChildren: nodeHelperCollectChildrenStub,
  } as unknown as NodeHelper

  const eventHelperCreateFolderEventStub = stub()
  const enentHelperCreateFileEventStub = stub()
  const eventHelper = {
    createFolderEvent: eventHelperCreateFolderEventStub,
    createFileEvent: enentHelperCreateFileEventStub,
  } as unknown as EventHelper

  const findAccessibleStub = stub()
  const findAccessibleOneStub = stub()
  const findEditableStub = stub()
  const findEditableOneStub = stub()
  const nodeLoadIfAccessibleByUserStub = stub()

  const editableSpacesStub = stub()
  const accessibleSpaceIdsStub = stub()

  const USER = {
    id: USER_ID,
    isSiteAdmin: isSiteAdminStub,
    isChallengeAdmin: isChallengeAdminStub,
    editableSpaces: editableSpacesStub,
    accessibleSpaceIds: accessibleSpaceIdsStub,
  } as unknown as User
  const USER_CTX: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity: async () => USER,
  }

  const fileRepository = {
    loadIfAccessibleByUser: fileRepoFindOneOrFailStub,
    findOneOrFail: fileRepoFindOneOrFailStub,
    findOne: fileRepoFindOneStub,
    count: fileRepoCountStub,
    findEditable: findEditableStub,
  } as unknown as UserFileRepository
  const licensedItemRepo = {
    getLicenseItemsForNode: getLicenseItemsForNodeStub,
  } as unknown as LicensedItemRepository
  const spaceRepository = {
    findOne: spaceFindOneStub,
  } as unknown as SpaceRepository
  const nodeRepository = {
    findOneOrFail: nodeRepoFindOneOrFailStub,
    findEditable: findEditableStub,
    findAccessible: findAccessibleStub,
    findAccessibleOne: findAccessibleOneStub,
    findEditableOne: findEditableOneStub,
    loadIfAccessibleByUser: nodeLoadIfAccessibleByUserStub,
  } as unknown as NodeRepository

  const transactionalStub = sinon.stub()
  const em = {
    findOne: emFindOneStub,
    find: emFindStub,
    count: emCountStub,
    findOneOrFail: emFindOneOrFailStub,
    persistAndFlush: persistAndFlushStub,
    persist: persistStub,
    getReference: getReferenceStub,
    flush: flushStub,
    transactional: transactionalStub,
    remove: removeStub,
    clear: clearStub,
    populate: emPopulateStub,
  } as unknown as SqlEntityManager

  const spaceEventService = {
    createAndSendSpaceEvent: createAndSendSpaceEventStub,
  } as unknown as SpaceEventService

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(USER).returns(USER)
    createFileSynchronizeJobTaskStub = stub(queue, 'createFileSynchronizeJobTask')

    getReferenceStub.reset()
    getReferenceStub.throws()
    getReferenceStub.withArgs(User, USER_ID).returns(USER)

    getWarningsForUnclosedFilesStub.reset()
    getWarningsForUnclosedFilesStub.throws()
    sanitizeNodeNamesStub.reset()
    // sanitizeNodeNamesStub.throws() // doesn't work with fakeCall
    renameDuplicateFilesStub.reset()
    // renameDuplicateFilesStub.throws() // doesn't work with fakeCall

    fileLoadIfAccessibleByUserStub.reset()
    fileLoadIfAccessibleByUserStub.throws()

    fileRepoFindOneOrFailStub.reset()
    fileRepoFindOneOrFailStub.throws()

    fileRepoCountStub.reset()
    fileRepoCountStub.throws()

    fileRepoFindOneStub.reset()
    fileRepoFindOneStub.throws()

    folderRepoFindOneStub.reset()
    folderRepoFindOneStub.throws()

    nodeHelperGetParentFolderStub.reset()
    nodeHelperGetParentFolderStub.throws()

    nodeHelperCollectChildrenStub.reset()
    nodeHelperCollectChildrenStub.throws()

    getLicenseItemsForNodeStub.reset()
    getLicenseItemsForNodeStub.throws()

    userClientFileCloseStub.reset()
    userClientFileCloseStub.throws()

    challengeBotClientFileCloseStub.reset()
    challengeBotClientFileCloseStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
    userRepoFindOneOrFailStub.withArgs(USER_ID).returns(USER)
    userRepoFindOneOrFailStub
      .withArgs({ id: USER_ID }, { populate: ['spaceMemberships', 'spaceMemberships.spaces'] })
      .returns(USER)

    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()

    createAndSendSpaceEventStub.reset()
    createAndSendSpaceEventStub.throws()

    createFileSynchronizeJobTaskStub.reset()
    createFileSynchronizeJobTaskStub.throws()

    findEditableStub.reset()
    findEditableStub.throws()
    findAccessibleStub.reset()
    findAccessibleStub.throws()

    findEditableOneStub.reset()
    findEditableOneStub.throws()
    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()

    fileDownloadLinkStub.reset()
    fileDownloadLinkStub.throws()
    fileDescribeStub.reset()
    fileDescribeStub.throws()
    fileRemoveStub.reset()
    fileRemoveStub.throws()

    challengeBotFileDescribeStub.reset()
    challengeBotFileDescribeStub.throws()

    nodeRepoFindOneOrFailStub.reset()
    nodeRepoFindOneOrFailStub.throws()

    createNotificationStub.reset()
    createNotificationStub.throws()

    isSiteAdminStub.returns(false)
    isChallengeAdminStub.returns(false)

    persistAndFlushStub.reset()
    persistStub.reset()

    removeStub.reset()
    removeStub.throws()

    clearStub.reset()
    clearStub.throws()

    emPopulateStub.reset()
    emPopulateStub.throws()

    transactionalStub.callsFake(async (callback) => {
      return callback(em)
    })

    removeTaggingsStub.reset()
    removeTaggingsStub.throws()

    createSpaceEventStub.reset()
    createSpaceEventStub.throws()

    emFindOneStub.reset()
    emFindOneStub.throws()

    emFindStub.reset()
    emFindStub.throws()

    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()

    accessibleSpaceIdsStub.reset()
    accessibleSpaceIdsStub.throws()

    nodeLoadIfAccessibleByUserStub.reset()
    nodeLoadIfAccessibleByUserStub.throws()

    nodeHelperGetNodePathStub.reset()
    nodeHelperGetNodePathStub.throws()

    eventHelperCreateFolderEventStub.reset()
    eventHelperCreateFolderEventStub.throws()

    enentHelperCreateFileEventStub.reset()
    enentHelperCreateFileEventStub.throws()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    createFileSynchronizeJobTaskStub.restore()
  })

  describe('#createFile', () => {
    it('should not catch error from getReference', async () => {
      const error = new Error('my error')
      getReferenceStub.reset()
      getReferenceStub.throws(error)

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should not catch error from persistAndFlush', async () => {
      const error = new Error('my error')
      getReferenceStub.reset()
      getReferenceStub.throws(error)

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should create the correct UserFile', async () => {
      const res = await getInstance().createFile(FILE_CREATE)

      expect(res.dxid).to.eq(DXID)
      expect(res.scopedParentFolderId).to.eq(SCOPED_PARENT_FOLDER_ID)
      expect(res.parentFolderId).to.eq(PARENT_FOLDER_ID)
      expect(res.project).to.eq(PROJECT)
      expect(res.description).to.eq(DESCRIPTION)
      expect(res.user).to.eq(USER)
      expect(res.name).to.eq(NAME)
      expect(res.state).to.eq(STATE)
      expect(res.parentId).to.eq(PARENT_ID)
      expect(res.parentType).to.eq(FILE_PARENT_TYPE)
      expect(res.scope).to.eq(FILE_SCOPE)
      expect(res.uid).to.eq(`${DXID}-1`)
    })
  })

  describe('#closeFile', () => {
    it('should close file', async () => {
      const userFile = {
        uid: 'file-dxid-1',
        state: FILE_STATE_DX.OPEN,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => false,
      } as unknown as UserFile

      const spaceIds = [1, 2, 3]
      accessibleSpaceIdsStub.returns(spaceIds)

      fileRepoFindOneOrFailStub.withArgs({ uid: UID }, match.any).returns(userFile)
      nodeLoadIfAccessibleByUserStub.withArgs(USER, UID, spaceIds).returns(userFile)
      createFileSynchronizeJobTaskStub.reset()
      userClientFileCloseStub.reset()

      await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')

      expect(createFileSynchronizeJobTaskStub.calledOnce).to.be.true()
      expect(createFileSynchronizeJobTaskStub.firstCall.args[0]).deep.eq({
        fileUid: userFile.uid,
        isChallengeBotFile: false,
        followUpAction: 'UPDATE_DATA_PORTAL_IMAGE_URL',
      })
      expect(userFile.state).to.eq(FILE_STATE_DX.CLOSING)
    })

    it('should skip closing file - file already in closing state', async () => {
      const userFile = {
        state: FILE_STATE_DX.CLOSING,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => false,
      } as unknown as UserFile

      const spaceIds = [1, 2, 3]
      accessibleSpaceIdsStub.returns(spaceIds)

      fileRepoFindOneOrFailStub.withArgs({ uid: UID }, match.any).returns(userFile)
      nodeLoadIfAccessibleByUserStub.withArgs(USER, UID, spaceIds).returns(userFile)

      await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')
      expect(userClientFileCloseStub.calledOnce).to.be.false()
    })

    it('should close file created by challenge bot', async () => {
      isChallengeAdminStub.returns(true)
      const userFile = {
        uid: 'file-dxid-1',
        state: FILE_STATE_DX.OPEN,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => true,
      } as unknown as UserFile

      fileRepoFindOneStub.withArgs({ uid: UID }, match.any).returns(userFile)
      createFileSynchronizeJobTaskStub.reset()
      challengeBotClientFileCloseStub.reset()

      await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')

      expect(createFileSynchronizeJobTaskStub.calledOnce).to.be.true()
      expect(createFileSynchronizeJobTaskStub.firstCall.args[0]).deep.eq({
        fileUid: userFile.uid,
        isChallengeBotFile: true,
        followUpAction: 'UPDATE_DATA_PORTAL_IMAGE_URL',
      })

      expect(userFile.state).to.eq(FILE_STATE_DX.CLOSING)
    })
  })

  describe('#synchronizeFile', () => {
    it('should synchronize file', async () => {
      const org = new Organization()
      const user = new User(org)
      const node = new UserFile(user)
      node.dxid = DXID
      node.name = NAME
      node.project = PROJECT
      node.scope = 'private'
      fileDescribeStub.returns({
        state: FILE_STATE_DX.CLOSED,
        size: 10,
      })
      nodeRepoFindOneOrFailStub.withArgs({ uid: UID }).returns(node)

      const res = await getInstance().synchronizeFile(UID, false)

      expect(res).to.be.true()
      expect(fileDescribeStub.calledOnce).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
    })

    it('should synchronize file in space', async () => {
      const org = new Organization()
      const user = new User(org)
      const node = new UserFile(user)
      node.dxid = DXID
      node.name = NAME
      node.project = PROJECT
      node.scope = 'space-1'
      fileDescribeStub.returns({
        state: FILE_STATE_DX.CLOSED,
        size: 10,
      })
      nodeRepoFindOneOrFailStub.withArgs({ uid: UID }).returns(node)
      createAndSendSpaceEventStub.reset()

      const res = await getInstance().synchronizeFile(UID, false)

      expect(res).to.be.true()
      expect(fileDescribeStub.calledOnce).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
      expect(createAndSendSpaceEventStub.calledOnce).to.be.true()
      expect(createAndSendSpaceEventStub.firstCall.args[0]).deep.eq({
        spaceId: 1,
        userId: 0,
        entity: {
          type: 'userFile',
          value: node,
        },
        activityType: SPACE_EVENT_ACTIVITY_TYPE.file_added,
      })
    })

    it('should synchronize file (challenge bot file)', async () => {
      const org = new Organization()
      const user = new User(org)
      const node = new UserFile(user)
      node.dxid = DXID
      node.name = NAME
      node.project = PROJECT

      challengeBotFileDescribeStub.returns({
        state: FILE_STATE_DX.CLOSED,
        size: 10,
      })
      nodeRepoFindOneOrFailStub.withArgs({ uid: UID }).returns(node)

      const res = await getInstance().synchronizeFile(UID, true)

      expect(res).to.be.true()
      expect(challengeBotFileDescribeStub.calledOnce).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
    })
  })

  describe('#listSelectedFiles', async () => {
    const file1 = {
      id: 5,
      name: 'file1',
      type: FILE_STI_TYPE.USERFILE,
      state: FILE_STATE_DX.CLOSED,
      uid: 'file-uid-1',
      scope: STATIC_SCOPE.PRIVATE,
      folderPath: '/',
      isFile: true,
    } as unknown as UserFile

    const folder2 = {
      id: 6,
      name: 'folder2',
      type: FILE_STI_TYPE.FOLDER,
      scope: STATIC_SCOPE.PRIVATE,
      isFile: false,
    } as unknown as Folder

    it('should return empty array if nodes are not accessible', async () => {
      findAccessibleStub.resolves([])
      const res = await getInstance().listSelectedFiles([1, 2])
      expect(res).to.deep.eq([])
    })

    it('should return accessible files', async () => {
      findAccessibleStub
        .withArgs({
          id: [file1.id, folder2.id],
          stiType: { $in: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.FOLDER] },
        })
        .returns([file1, folder2])
      nodeHelperGetParentFolderStub.reset()
      nodeHelperCollectChildrenStub.reset()

      const res = await getInstance().listSelectedFiles([file1.id, folder2.id])
      expect(res.length).to.eq(2)
      expect((res[0] as SelectedFile).sourceFolderId).to.eq(undefined)
      nodeHelperCollectChildrenStub.reset()
    })
  })

  describe('#validateCopyFiles', async () => {
    const SPACE = 'space-1'
    const FILE_UID1 = 'file-uid1-1'
    const FILE_DXID1 = 'file-uid1'
    const FILE_UID2 = 'file-uid2-2'
    const FILE_DXID2 = 'file-uid2'
    const FILE_UID3 = 'file-uid3-3'
    const FILE_DXID3 = 'file-uid3'
    const existingFile1 = {
      id: 1,
      dxid: FILE_DXID1,
      uid: FILE_UID1,
      scope: SPACE,
    } as unknown as UserFile
    const existingFile2 = {
      id: 2,
      dxid: FILE_DXID2,
      uid: FILE_UID2,
      scope: SPACE,
    } as unknown as UserFile

    it('should throw error if user does not have access to target space', async () => {
      editableSpacesStub.returns([])
      const uid = 'file-uid-1'
      await expect(getInstance().validateCopyFiles([uid], `space-1`)).to.be.rejectedWith(
        PermissionError,
        'You do not have permission to copy files to this scope',
      )
    })

    it('should return editable files which exist in the target space', async () => {
      editableSpacesStub.returns([{ scope: 'space-1' }])
      findEditableStub
        .withArgs({
          dxid: { $in: [FILE_DXID1, FILE_DXID2, FILE_DXID3] },
          scope: SPACE,
        })
        .returns([existingFile1, existingFile2])
      nodeHelperGetNodePathStub.returns('path')

      const res = await getInstance().validateCopyFiles([FILE_UID1, FILE_UID2, FILE_UID3], SPACE)
      expect(Object.keys(res).length).to.eq(2)
    })
  })

  describe('#validateProtectedSpaces', () => {
    const userFileService = getInstance()
    it('do nothing if not in space', async () => {
      const nodeNotInSpace = {
        isInSpace: () => false,
      } as unknown as Node

      await userFileService.validateProtectedSpaces('action', 1, nodeNotInSpace)

      expect(spaceFindOneStub.callCount).to.eq(0)
    })

    it('find space and find leaderships', async () => {
      const nodeInSpace = {
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      spaceFindOneStub.returns({
        spaceMemberships: {
          getItems: () => ({
            find: (membership): SpaceMembership => membership
          }),
        },
      } as unknown as Space)

      await userFileService.validateProtectedSpaces('action', 1, nodeInSpace)
      expect(spaceFindOneStub.calledOnce).to.be.true()
      expect(spaceFindOneStub.firstCall.args[0]).to.eq(1)
      expect(spaceFindOneStub.firstCall.args[1]).to.deep.eq({
        populate: ['spaceMemberships', 'spaceMemberships.user'],
      })
    })

    it('throw error if not in leadership', async () => {})
  })

  describe('#validateAssetRemoval', async () => {
    it('has license and no app - no error', async () => {
      const asset = {
        id: 1,
        apps: {
          count: () => 0,
        },
      } as unknown as Asset
      emPopulateStub.reset()
      getLicenseItemsForNodeStub.withArgs(asset.id).returns([{}])

      const userFileService = getInstance()
      await userFileService.validateAssetRemoval(asset)

      expect(emPopulateStub.calledOnce).to.be.true()
    })

    it('has app and no license - no error', async () => {
      const asset = {
        id: 1,
        apps: {
          count: () => 1,
        },
      } as unknown as Asset
      emPopulateStub.reset()
      getLicenseItemsForNodeStub.withArgs(asset.id).returns([])

      const userFileService = getInstance()
      await userFileService.validateAssetRemoval(asset)

      expect(emPopulateStub.calledOnce).to.be.true()
    })

    it('has app and license - throws error', async () => {
      const asset = {
        id: 1,
        apps: {
          count: () => 1,
        },
      } as unknown as Asset
      emPopulateStub.reset()
      getLicenseItemsForNodeStub.withArgs(asset.id).returns([{}])

      const userFileService = getInstance()
      await expect(userFileService.validateAssetRemoval(asset)).to.be.rejectedWith(
        ValidationError,
        ASSET_VALIDATION_ERROR,
      )
    })
  })

  function getInstance(): UserFileService {
    return new UserFileService(
      em,
      USER_CTX,
      userClient,
      challengeBotClient,
      nodeRepository,
      fileRepository,
      spaceRepository,
      licensedItemRepo,
      nodeHelper,
      eventHelper,
      spaceEventService,
      notificationService,
    )
  }
})
