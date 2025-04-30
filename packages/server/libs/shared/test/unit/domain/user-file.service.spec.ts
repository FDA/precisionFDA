import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Event } from '@shared/domain/event/event.entity'
import * as eventHelper from '@shared/domain/event/event.helper'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import {
  FILE_STATE_DX,
  FILE_STI_TYPE,
  PARENT_TYPE,
  SelectedFile,
} from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import * as queue from '@shared/queue'
import { expect } from 'chai'
import sinon, { SinonStub, match, stub } from 'sinon'
import { NodeService } from '@shared/domain/user-file/node.service'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'

//TODO: PFDA-6214 - uncomment the skip when the user-file service is fixed.
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
  const nodeLoadIfAccessibleByUserStub = stub()

  const isSiteAdminStub = stub()
  const isChallengeAdminStub = stub()

  const getWarningsForUnclosedFilesStub = stub()
  const sanitizeNodeNamesStub = stub()
  const renameDuplicateFilesStub = stub()

  const getEntityDownloadLinkStub = stub()

  const createAndSendSpaceEventStub = stub()

  const fileDownloadLinkStub = stub()
  const fileDescribeStub = stub()
  const fileRemoveStub = stub()

  const spaceFindOneStub = stub()

  const removeTaggingsStub = stub()

  const createSpaceEventStub = stub()
  const emFindOneStub = stub()
  const emFindStub = stub()
  const emCountStub = stub()
  const emFindOneOrFailStub = stub()

  let createFileSynchronizeJobTaskStub: SinonStub
  let loadNodesStub = stub()
  let getNodePathStub: SinonStub
  let createFileEventStub: SinonStub
  let createFolderEventStub: SinonStub
  let collectChildrenStub = stub()
  let referenceCreateStub: SinonStub

  const userClient = {
    fileDownloadLink: fileDownloadLinkStub,
    fileDescribe: fileDescribeStub,
    fileRemove: fileRemoveStub,
  } as unknown as PlatformClient

  const challengeBotFileDescribeStub = stub()
  const challengeBotClient = {
    fileDescribe: challengeBotFileDescribeStub,
  } as unknown as PlatformClient

  const createNotificationStub = stub()
  const notificationService = {
    createNotification: createNotificationStub,
  } as unknown as NotificationService

  const findAccessibleStub = stub()
  const findAccessibleOneStub = stub()
  const findEditableStub = stub()
  const findEditableOneStub = stub()

  const editableSpacesStub = stub()

  const USER = {
    id: USER_ID,
    isSiteAdmin: isSiteAdminStub,
    isChallengeAdmin: isChallengeAdminStub,
    editableSpaces: editableSpacesStub,
  }
  const USER_CTX: UserCtx = { ...USER, accessToken: 'accessToken', dxuser: 'dxuser' }

  const fileRepository = {
    loadIfAccessibleByUser: fileRepoFindOneOrFailStub,
    findOneOrFail: fileRepoFindOneOrFailStub,
    findOne: fileRepoFindOneStub,
    count: fileRepoCountStub,
    findEditable: findEditableStub,
  } as unknown as UserFileRepository
  const userRepository = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const spaceRepository = {
    findOne: spaceFindOneStub,
  } as unknown as SpaceRepository
  const nodeRepository = {
    findOneOrFail: nodeRepoFindOneOrFailStub,
    loadIfAccessibleByUser: nodeLoadIfAccessibleByUserStub,
    findEditable: findEditableStub,
    findAccessible: findAccessibleStub,
    findAccessibleOne: findAccessibleOneStub,
    findEditableOne: findEditableOneStub,
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
  } as unknown as SqlEntityManager

  const nodesHelper = {
    getWarningsForUnclosedFiles: getWarningsForUnclosedFilesStub,
    sanitizeNodeNames: sanitizeNodeNamesStub,
    renameDuplicateFiles: renameDuplicateFilesStub,
  } as unknown as NodeHelper

  const entityService = {
    getEntityDownloadLink: getEntityDownloadLinkStub,
  } as unknown as EntityService

  const nodeService = {
    collectChildren: collectChildrenStub,
    loadNodes: loadNodesStub,
  } as unknown as NodeService

  const spaceEventService = {
    createAndSendSpaceEvent: createAndSendSpaceEventStub,
  } as unknown as SpaceEventService

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(USER).returns(USER)
    createFileSynchronizeJobTaskStub = stub(queue, 'createFileSynchronizeJobTask')
    getNodePathStub = stub(userFileHelper, 'getNodePath')
    createFileEventStub = stub(eventHelper, 'createFileEvent')
    createFolderEventStub = stub(eventHelper, 'createFolderEvent')

    loadNodesStub.reset()
    loadNodesStub.throws()
    getNodePathStub.reset()
    getNodePathStub.throws()

    createFileEventStub.reset()
    createFileEventStub.throws()

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

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
    userRepoFindOneOrFailStub.withArgs(USER_ID).returns(USER)
    userRepoFindOneOrFailStub
      .withArgs({ id: USER_ID }, { populate: ['spaceMemberships', 'spaceMemberships.spaces'] })
      .returns(USER)

    nodeLoadIfAccessibleByUserStub.reset()
    nodeLoadIfAccessibleByUserStub.throws()

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

    transactionalStub.callsFake(async (callback) => {
      return callback(em)
    })

    getEntityDownloadLinkStub.reset()
    getEntityDownloadLinkStub.throws()

    removeTaggingsStub.reset()
    removeTaggingsStub.throws()

    createSpaceEventStub.reset()
    createSpaceEventStub.throws()

    createFolderEventStub.reset()
    createFolderEventStub.throws()

    collectChildrenStub.reset()
    collectChildrenStub.throws()

    emFindOneStub.reset()
    emFindOneStub.throws()

    emFindStub.reset()
    emFindStub.throws()

    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    createFileSynchronizeJobTaskStub.restore()
    getNodePathStub.restore()
    createFileEventStub.restore()
    createFolderEventStub.restore()
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
        state: FILE_STATE_DX.OPEN,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => false,
      } as unknown as UserFile

      fileRepoFindOneOrFailStub.withArgs({ uid: UID }, match.any).returns(userFile)
      nodeLoadIfAccessibleByUserStub.withArgs(USER, UID).returns(userFile)
      createFileSynchronizeJobTaskStub.reset()

      await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')

      expect(createFileSynchronizeJobTaskStub.calledOnce).to.be.true
      expect(createFileSynchronizeJobTaskStub.firstCall.args[0]).deep.eq({
        fileUid: 'file-dxid-1',
        isChallengeBotFile: false,
        followUpAction: 'UPDATE_DATA_PORTAL_IMAGE_URL',
      })
    })

    it('should throw ValidationError - file not in open state', async () => {
      const userFile = {
        state: FILE_STATE_DX.CLOSING,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => false,
      } as unknown as UserFile

      fileRepoFindOneOrFailStub.withArgs({ uid: UID }, match.any).returns(userFile)
      nodeLoadIfAccessibleByUserStub.withArgs(USER, UID).returns(userFile)
      createFileSynchronizeJobTaskStub.reset()

      try {
        await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')
        expect.fail('should have thrown error')
      } catch (error) {
        expect(error.name).to.eq('ValidationError')
        expect(error.message).to.eq(`File ${UID} is not in open state. Current state: "closing"`)
      }
    })

    it('should close file created by challenge bot', async () => {
      isChallengeAdminStub.returns(true)
      const userFile = {
        state: FILE_STATE_DX.OPEN,
        challengeResources: [stub()],
        isCreatedByChallengeBot: () => true,
      } as unknown as UserFile

      fileRepoFindOneStub.withArgs({ uid: UID }, match.any).returns(userFile)
      createFileSynchronizeJobTaskStub.reset()

      await getInstance().closeFile(UID, 'UPDATE_DATA_PORTAL_IMAGE_URL')

      expect(createFileSynchronizeJobTaskStub.calledOnce).to.be.true
      expect(createFileSynchronizeJobTaskStub.firstCall.args[0]).deep.eq({
        fileUid: 'file-dxid-1',
        isChallengeBotFile: true,
        followUpAction: 'UPDATE_DATA_PORTAL_IMAGE_URL',
      })
    })
  })

  describe('#synchronizeFile', () => {
    it('should synchronize file', async () => {
      const node = new Node()
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

      expect(res).to.be.true
      expect(fileDescribeStub.calledOnce).to.be.true
      expect(createNotificationStub.calledOnce).to.be.true
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
    })

    it('should synchronize file in space', async () => {
      const node = new Node()
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

      expect(res).to.be.true
      expect(fileDescribeStub.calledOnce).to.be.true
      expect(createNotificationStub.calledOnce).to.be.true
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
      expect(createAndSendSpaceEventStub.calledOnce).to.be.true
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
      const node = new Node()
      node.dxid = DXID
      node.name = NAME
      node.project = PROJECT

      challengeBotFileDescribeStub.returns({
        state: FILE_STATE_DX.CLOSED,
        size: 10,
      })
      nodeRepoFindOneOrFailStub.withArgs({ uid: UID }).returns(node)

      const res = await getInstance().synchronizeFile(UID, true)

      expect(res).to.be.true
      expect(fileDescribeStub.calledOnce).to.be.true
      expect(createNotificationStub.calledOnce).to.be.true
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `File ${NAME} is closed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.FILE_CLOSED,
        userId: USER.id,
      })
    })
  })

  describe('#composeFilesForBulkDownload', () => {
    it('correct preparation of two files', async () => {
      getWarningsForUnclosedFilesStub.returns(null)
      sanitizeNodeNamesStub.callsFake((nodes) => {
        return nodes
      })
      renameDuplicateFilesStub.callsFake((nodes) => {
        return nodes
      })
      const commonNode = {
        stiType: FILE_STI_TYPE.USERFILE,
        project: 'project',
        state: 'closed',
      }
      loadNodesStub.returns([
        { id: 123, uid: 'file-123-1', dxid: 'file-123', name: 'name-123', ...commonNode },
        { id: 234, uid: 'file-234-1', dxid: 'file-234', name: 'name-234', ...commonNode },
      ])

      findAccessibleStub.returns([{} as UserFile, {} as UserFile])
      getNodePathStub.withArgs(match.any, match.has('id', 123)).returns('file-123-1_path')
      getNodePathStub.withArgs(match.any, match.has('id', 234)).returns('file-234-1_path')

      fileDownloadLinkStub.returns({ url: 'http://download-link.com' })
      const fileEvent = { type: eventHelper.EVENT_TYPES.FILE_BULK_DOWNLOAD } as Event
      createFileEventStub.returns({ ...fileEvent, param1: 'file_path' })

      const IDs = [123, 234]
      const response = await getInstance().composeFilesForBulkDownload(IDs)

      // assert
      expect(loadNodesStub.calledOnce).to.be.true
      expect(loadNodesStub.firstCall.args[0]).to.eq(IDs)

      expect(fileDownloadLinkStub.calledTwice).to.be.true
      expect(fileDownloadLinkStub.firstCall.args[0]).to.deep.eq({
        fileDxid: 'file-123',
        filename: 'name-123',
        project: 'project',
        duration: 24 * 60 * 60,
      })
      expect(fileDownloadLinkStub.secondCall.args[0]).to.deep.eq({
        fileDxid: 'file-234',
        filename: 'name-234',
        project: 'project',
        duration: 24 * 60 * 60,
      })

      expect(createFileEventStub.calledTwice).to.be.true
      expect(createFileEventStub.firstCall.args[0]).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)
      expect(createFileEventStub.firstCall.args[2]).to.eq('file-123-1_path')
      expect(createFileEventStub.firstCall.args[3]).to.deep.eq(USER)
      expect(createFileEventStub.secondCall.args[0]).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)
      expect(createFileEventStub.secondCall.args[2]).to.eq('file-234-1_path')
      expect(createFileEventStub.secondCall.args[3]).to.deep.eq(USER)

      expect(persistStub.calledTwice).to.be.true
      expect(persistStub.firstCall.args[0].type).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)
      expect(persistStub.firstCall.args[0].param1).to.eq('file_path')
      expect(persistStub.secondCall.args[0].type).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)
      expect(persistStub.secondCall.args[0].param1).to.eq('file_path')

      expect(response.files.length).to.eq(2)
      expect(response.files[0].url).to.eq('http://download-link.com')
      expect(response.files[0].path).to.eq('file-123-1_path')
      expect(response.files[1].url).to.eq('http://download-link.com')
      expect(response.files[1].path).to.eq('file-234-1_path')
    })

    it("user doesn't have access to at least one file", async () => {
      loadNodesStub.returns([{ name: 'object_1' }, { name: 'object_2' }])

      findAccessibleStub.returns([{} as UserFile])

      await expect(getInstance().composeFilesForBulkDownload([10, 20])).to.be.rejectedWith(
        PermissionError,
        'You do not have permission to download all of these files',
      )
    })
  })

  describe('#getDownloadLink', () => {
    it('should not catch error from entity service', async () => {
      const error = new Error('my error')
      getEntityDownloadLinkStub.throws(error)

      const file = { id: 0 } as unknown as UserFile

      await expect(getInstance().getDownloadLink(file)).to.be.rejectedWith(error)
    })

    it('should return the result from entity service', async () => {
      const file = { id: 0, name: 'NAME' } as unknown as UserFile
      const options = { preauthenticated: true }
      getEntityDownloadLinkStub.withArgs(file, file.name, options).resolves('LINK')

      const res = await getInstance().getDownloadLink(file, options)

      expect(res).to.eq('LINK')
    })
  })

  describe('#getDownloadLinkForUid', () => {
    const FILE_UID = 'file-uid-1'
    const FILE_NAME = 'FILE_NAME'
    const FILE = {
      name: FILE_NAME,
      uid: FILE_UID,
      state: FILE_STATE_DX.CLOSED,
    } as unknown as UserFile
    const OPTIONS = { preauthenticated: true }

    beforeEach(() => {
      getEntityDownloadLinkStub.withArgs(FILE, FILE.name, OPTIONS).resolves('LINK')
      findAccessibleOneStub.withArgs(FILE_UID).resolves(FILE)
    })

    it('should not catch error from entity service', async () => {
      const error = new Error('my error')
      findAccessibleOneStub.withArgs({ uid: FILE_UID }).resolves(FILE)
      getEntityDownloadLinkStub.reset()
      getEntityDownloadLinkStub.throws(error)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(error)
    })

    it('should not catch error from entity fetcher', async () => {
      const error = new Error('my error')
      findAccessibleOneStub.reset()
      findAccessibleOneStub.throws(error)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(error)
    })

    it('should return result from entity service', async () => {
      findAccessibleOneStub.withArgs({ uid: FILE_UID }).resolves(FILE)
      const res = await getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)

      expect(res).to.eq('LINK')
    })

    it('should throw an error if file is not in CLOSED state', async () => {
      const openFile = { ...FILE, state: FILE_STATE_DX.OPEN } as unknown as UserFile
      findAccessibleOneStub.withArgs({ uid: FILE_UID }).resolves(openFile)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(
        Error,
        "Files can only be downloaded if they are in the 'closed' state",
      )
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
      collectChildrenStub.resolves()

      const res = await getInstance().listSelectedFiles([file1.id, folder2.id])
      expect(res.length).to.eq(2)
      expect((res[0] as SelectedFile).sourceFolderId).to.eq(undefined)
      expect(collectChildrenStub.calledOnce).to.be.true
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
      getNodePathStub.returns('path')

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
          getItems: () => {
            find: (membership) => membership
          },
        },
      } as unknown as Space)

      await userFileService.validateProtectedSpaces('action', 1, nodeInSpace)
      expect(spaceFindOneStub.calledOnce).to.be.true
      expect(spaceFindOneStub.firstCall.args[0]).to.eq(1)
      expect(spaceFindOneStub.firstCall.args[1]).to.deep.eq({
        populate: ['spaceMemberships', 'spaceMemberships.user'],
      })
    })

    it('throw error if not in leadership', async () => {})
  })

  function getInstance() {
    return new UserFileService(
      em,
      USER_CTX,
      userClient,
      challengeBotClient,
      notificationService,
      nodeRepository,
      fileRepository,
      userRepository,
      spaceRepository,
      nodesHelper,
      entityService,
      nodeService,
      spaceEventService,
    )
  }
})
