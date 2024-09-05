import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Event } from '@shared/domain/event/event.entity'
import * as eventHelper from '@shared/domain/event/event.helper'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
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
import { DeleteRelationError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import * as queue from '@shared/queue'
import { expect } from 'chai'
import sinon, { SinonStub, match, restore, stub } from 'sinon'

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

  const fileDownloadLinkStub = stub()
  const fileDescribeStub = stub()
  const fileRemoveStub = stub()

  const removeTaggingsStub = stub()

  const createSpaceEventStub = stub()
  const emFindOneStub = stub()
  const emFindStub = stub()
  const emCountStub = stub()
  const emFindOneOrFailStub = stub()

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

  const getAccessibleByIdsStub = stub()
  const getAccessibleByUidStub = stub()
  const getAccessibleByIdStub = stub()
  const getEditableSpacesStub = stub()
  const getEditableStub = stub()
  const entityFetcherService = {
    getAccessibleByIds: getAccessibleByIdsStub,
    getAccessibleByUid: getAccessibleByUidStub,
    getAccessibleById: getAccessibleByIdStub,
    getEditableSpaces: getEditableSpacesStub,
    getEditable: getEditableStub,
  } as unknown as EntityFetcherService

  const USER = {
    id: USER_ID,
    isSiteAdmin: isSiteAdminStub,
    isChallengeAdmin: isChallengeAdminStub,
  }
  const USER_CTX: UserCtx = { ...USER, accessToken: 'accessToken', dxuser: 'dxuser' }

  const fileRepository = {
    loadIfAccessibleByUser: fileRepoFindOneOrFailStub,
    findOneOrFail: fileRepoFindOneOrFailStub,
    findOne: fileRepoFindOneStub,
    count: fileRepoCountStub,
  } as unknown as UserFileRepository
  const folderRepository = {
    findOne: folderRepoFindOneStub,
  } as unknown as FolderRepository
  const userRepository = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const nodeRepository = {
    findOneOrFail: nodeRepoFindOneOrFailStub,
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
  } as unknown as SqlEntityManager

  const nodesHelper = {
    getWarningsForUnclosedFiles: getWarningsForUnclosedFilesStub,
    sanitizeNodeNames: sanitizeNodeNamesStub,
    renameDuplicateFiles: renameDuplicateFilesStub,
  } as unknown as NodeHelper

  const entityService = {
    getEntityDownloadLink: getEntityDownloadLinkStub,
  } as unknown as EntityService

  const taggingService = {
    removeTaggings: removeTaggingsStub,
  } as unknown as TaggingService

  const spaceEventService = {
    createSpaceEvent: createSpaceEventStub,
  } as unknown as SpaceEventService

  let createFileSynchronizeJobTaskStub: SinonStub
  let loadNodesStub: SinonStub
  let getNodePathStub: SinonStub
  let createFileEventStub: SinonStub
  let createFolderEventStub: SinonStub
  let collectChildrenStub: SinonStub

  before(() => {
    stub(Reference, 'create').withArgs(USER).returns(USER)
    createFileSynchronizeJobTaskStub = stub(queue, 'createFileSynchronizeJobTask')
    getNodePathStub = stub(userFileHelper, 'getNodePath')
    loadNodesStub = stub(userFileHelper, 'loadNodes')
    createFileEventStub = stub(eventHelper, 'createFileEvent')
    createFolderEventStub = stub(eventHelper, 'createFolderEvent')
    collectChildrenStub = stub(userFileHelper, 'collectChildren')
  })

  beforeEach(() => {
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

    createFileSynchronizeJobTaskStub.reset()
    createFileSynchronizeJobTaskStub.throws()

    getAccessibleByIdsStub.reset()
    getAccessibleByIdsStub.throws()

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

    getAccessibleByUidStub.reset()
    getAccessibleByUidStub.throws()

    getAccessibleByIdStub.reset()
    getAccessibleByIdStub.throws()

    getEditableSpacesStub.reset()
    getEditableSpacesStub.throws()

    getEditableStub.reset()
    getEditableStub.throws()

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

  after(() => {
    restore()
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
      const node = {
        dxid: DXID,
        name: NAME,
        project: PROJECT,
      } as unknown as Node
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

    it('should synchronize file (challenge bot file)', async () => {
      const node = {
        dxid: DXID,
        name: NAME,
        project: PROJECT,
      } as unknown as Node
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

      getAccessibleByIdsStub.returns([{} as UserFile, {} as UserFile])
      getNodePathStub.withArgs(match.any, match.has('id', 123)).returns('file-123-1_path')
      getNodePathStub.withArgs(match.any, match.has('id', 234)).returns('file-234-1_path')

      fileDownloadLinkStub.returns({ url: 'http://download-link.com' })
      const fileEvent = { type: eventHelper.EVENT_TYPES.FILE_BULK_DOWNLOAD } as Event
      createFileEventStub.returns({ ...fileEvent, param1: 'file_path' })

      const IDs = [123, 234]
      const response = await getInstance().composeFilesForBulkDownload(IDs)

      // assert
      expect(loadNodesStub.calledOnce).to.be.true
      expect(loadNodesStub.firstCall.args[1].ids).to.eq(IDs)

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

      getAccessibleByIdsStub.returns([{} as UserFile])

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
    const FILE = { name: FILE_NAME, uid: FILE_UID, state: FILE_STATE_DX.CLOSED } as unknown as UserFile
    const OPTIONS = { preauthenticated: true }

    beforeEach(() => {
      getEntityDownloadLinkStub.withArgs(FILE, FILE.name, OPTIONS).resolves('LINK')
      getAccessibleByUidStub.withArgs(Node, FILE_UID).resolves(FILE)
    })

    it('should not catch error from entity service', async () => {
      const error = new Error('my error')
      getEntityDownloadLinkStub.reset()
      getEntityDownloadLinkStub.throws(error)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(error)
    })

    it('should not catch error from entity fetcher', async () => {
      const error = new Error('my error')
      getAccessibleByUidStub.reset()
      getAccessibleByUidStub.throws(error)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(error)
    })

    it('should return result from entity service', async () => {
      const res = await getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)

      expect(res).to.eq('LINK')
    })

    it('should throw an error if file is not in CLOSED state', async () => {
      const openFile = { ...FILE, state: FILE_STATE_DX.OPEN } as unknown as UserFile
      getAccessibleByUidStub.withArgs(Node, FILE_UID).resolves(openFile)

      await expect(getInstance().getDownloadLinkForUid(FILE_UID, OPTIONS)).to.be.rejectedWith(Error, "Files can only be downloaded if they are in the 'closed' state")
    })
  })

  describe('#removeFolder', async () => {
    const FOLDER_ID = 1
    let folder = {
      id: FOLDER_ID,
      scope: STATIC_SCOPE.PUBLIC,
      children: {
        init: () => [],
        length: 0,
      },
    } as unknown as Folder

    it('test remove folder', async () => {
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      getNodePathStub.returns('')
      removeTaggingsStub.reset()
      createFolderEventStub.reset()
      removeStub.reset()

      const result = await getInstance().removeFolder(FOLDER_ID)

      expect(result).to.eq(1)

      expect(getNodePathStub.calledOnce).to.be.true
      expect(getNodePathStub.firstCall.args[1].id).to.eq(FOLDER_ID)

      expect(removeTaggingsStub.calledOnce).to.be.true
      expect(removeTaggingsStub.firstCall.args[0]).to.eq(FOLDER_ID)

      expect(createFolderEventStub.calledOnce).to.be.true
      expect(createFolderEventStub.firstCall.args[0]).to.eq(EVENT_TYPES.FOLDER_DELETED)

      expect(removeStub.calledOnce).to.be.true
      expect(removeStub.firstCall.args[0].id).to.eq(FOLDER_ID)
    })

    it('test fail remove folder - protected space', async () => {
      folder = {
        id: FOLDER_ID,
        name: 'folder-name',
        scope: 'space-1',
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      emFindOneOrFailStub.returns({
        protected: true,
        spaceMemberships: {
          getItems: () => [],
        },
      })
      emFindOneStub.returns(undefined)

      await expect(getInstance().removeFolder(FOLDER_ID)).to.be.rejectedWith(
        Error,
        'You have no permissions to remove from a Protected Space',
      )
    })

    it('test fail remove folder with children', async () => {
      folder = {
        id: FOLDER_ID,
        name: 'folder-name',
        scope: STATIC_SCOPE.PUBLIC,
        children: {
          init: () => [{}],
          length: 1,
        },
      } as unknown as Folder
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      await expect(getInstance().removeFolder(FOLDER_ID)).to.be.rejectedWith(
        Error,
        `Cannot remove folder ${folder.name} with children. Remove children first.`,
      )
    })

    it('test fail remove folder - editable by private scope and different user', async () => {
      folder = {
        id: FOLDER_ID,
        name: 'folder-name',
        scope: STATIC_SCOPE.PRIVATE,
        user: { id: 2 },
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      await expect(getInstance().removeFolder(FOLDER_ID)).to.be.rejectedWith(
        PermissionError,
        `You have no permissions to remove '${folder.name}'.`,
      )
    })

    it('test fail remove folder in locked verification space', async () => {
      folder = {
        id: FOLDER_ID,
        name: 'folder-name',
        scope: 'space-1',
        user: {
          id: USER_ID,
        },
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      emFindOneOrFailStub.returns({
        type: SPACE_TYPE.VERIFICATION,
        state: SPACE_STATE.LOCKED,
      })
      emFindOneStub.returns(undefined)

      await expect(getInstance().removeFolder(FOLDER_ID)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove ${folder.name} as` +
          ' it is part of Locked Verification space.',
      )
    })

    it('test fail remove file in space with no membership', async () => {
      folder = {
        id: FOLDER_ID,
        name: 'folder-name',
        scope: 'space-1',
        user: {
          id: 1234,
        },
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      folderRepoFindOneStub.withArgs(FOLDER_ID).returns(folder)
      emFindOneOrFailStub.returns({
        protected: false,
        spaceMemberships: {
          getItems: () => [],
        },
      })
      emFindOneStub.returns(undefined)

      await expect(getInstance().removeFolder(FOLDER_ID)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove '${folder.name}'.`,
      )
    })
  })

  describe('#removeFile', async () => {
    const FILE_ID = 1
    let file = {
      id: FILE_ID,
      scope: STATIC_SCOPE.PUBLIC,
    } as unknown as UserFile

    beforeEach(() => {
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)
      emFindStub.returns(undefined)
    })

    it('test remove file', async () => {
      emFindStub.returns(undefined)
      getNodePathStub.returns('')
      removeTaggingsStub.reset()
      createFileEventStub.reset()
      emCountStub.returns(0)
      fileRepoCountStub.returns(0)
      removeStub.reset()
      fileRemoveStub.reset()

      const result = await getInstance().removeFile(FILE_ID)

      expect(result).to.eq(1)

      expect(getNodePathStub.calledOnce).to.be.true
      expect(getNodePathStub.firstCall.args[1].id).to.eq(FILE_ID)

      expect(removeTaggingsStub.calledOnce).to.be.true
      expect(removeTaggingsStub.firstCall.args[0]).to.eq(FILE_ID)

      expect(createFileEventStub.calledOnce).to.be.true
      expect(createFileEventStub.firstCall.args[0]).to.eq(EVENT_TYPES.FILE_DELETED)

      expect(removeStub.calledOnce).to.be.true
      expect(removeStub.firstCall.args[0].id).to.eq(FILE_ID)
    })

    it('test fail remove file in comparison', async () => {
      emFindStub.returns([{}]) // it's in a comparison

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        Error,
        `File ${file.name} cannot be deleted because it participates` +
          ' in one or more comparisons. Please delete all the comparisons first.',
      )
    })

    it('test fail remove file not editable', async () => {
      file = {
        id: FILE_ID,
        name: 'file-name',
        scope: STATIC_SCOPE.PRIVATE,
        user: { id: 2 },
      } as unknown as UserFile
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        PermissionError,
        `You have no permissions to remove '${file.name}'.`,
      )
    })

    it('test fail remove file locked', async () => {
      file = {
        id: FILE_ID,
        name: 'file-name',
        locked: true,
      } as unknown as UserFile
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        Error,
        'Locked items cannot be removed.',
      )
    })

    it('test fail remove file in verification space', async () => {
      file = {
        id: FILE_ID,
        name: 'file-name',
        scope: 'space-1',
        user: {
          id: USER_ID,
        },
      } as unknown as UserFile
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)
      emFindOneOrFailStub.returns({
        type: SPACE_TYPE.VERIFICATION,
        state: SPACE_STATE.LOCKED,
      })

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove ${file.name} as` +
          ' it is part of Locked Verification space.',
      )
    })

    it('test fail remove file in protected space', async () => {
      file = {
        id: FILE_ID,
        name: 'file-name',
        scope: 'space-1',
        user: {
          id: USER_ID,
        },
      } as unknown as UserFile
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)
      emFindOneOrFailStub.returns({
        protected: true,
        spaceMemberships: {
          getItems: () => [],
        },
      })

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove from a Protected Space`,
      )
    })

    it('test fail to remove file in space reports', async () => {
      file = {
        id: FILE_ID,
        name: 'file-name',
        scope: STATIC_SCOPE.PRIVATE,
        user: {
          id: USER_ID,
        },
      } as unknown as UserFile
      fileRepoFindOneOrFailStub.withArgs(FILE_ID).returns(file)
      emCountStub.returns(5)

      await expect(getInstance().removeFile(FILE_ID)).to.be.rejectedWith(
        DeleteRelationError,
        'Cannot delete a file, as it is related to a space report',
      )
    })
  })

  describe('#removeNodes', async () => {
    it('test remove nodes', async () => {
      clearStub.reset()
      const fileInRoot = {
        id: 1,
        name: 'file-in-root',
        stiType: FILE_STI_TYPE.USERFILE,
        scope: STATIC_SCOPE.PUBLIC,
      } as UserFile
      const folderInRoot = {
        id: 2,
        name: 'folder-in-root',
        scope: STATIC_SCOPE.PUBLIC,
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      const nestedFolder = {
        id: 3,
        name: 'nested-folder',
        parentFolder: folderInRoot,
        scope: STATIC_SCOPE.PUBLIC,
        children: {
          init: () => [],
          length: 0,
        },
      } as unknown as Folder
      const fileInNestedFolder = {
        id: 4,
        name: 'nested-file',
        stiType: FILE_STI_TYPE.USERFILE,
        parentFolder: nestedFolder,
        scope: STATIC_SCOPE.PUBLIC,
      } as unknown as Folder
      loadNodesStub.returns([fileInNestedFolder, nestedFolder, folderInRoot, fileInRoot])
      fileRepoCountStub.returns(0)

      folderRepoFindOneStub.withArgs(folderInRoot.id).returns(folderInRoot)
      folderRepoFindOneStub.withArgs(nestedFolder.id).returns(nestedFolder)
      fileRepoFindOneOrFailStub.withArgs(fileInNestedFolder.id).returns(fileInNestedFolder)
      fileRepoFindOneOrFailStub.withArgs(fileInRoot.id).returns(fileInRoot)
      emFindStub.reset()
      emCountStub.reset()
      getNodePathStub.returns('')
      removeTaggingsStub.reset()
      createFolderEventStub.reset()
      createFileEventStub.reset()
      fileRepoCountStub.returns(0)
      removeStub.reset()

      const result = await getInstance().removeNodes([4, 3, 2, 1], false)

      expect(result).to.eq(4)

      expect(removeStub.callCount).to.eq(4)
      expect(removeStub.firstCall.args[0].id).to.eq(4)
      expect(removeStub.secondCall.args[0].id).to.eq(3)
      expect(removeStub.thirdCall.args[0].id).to.eq(2)
      expect(createNotificationStub.notCalled).to.be.true

      createNotificationStub.reset()
      await getInstance().removeNodes([4, 3, 2, 1], true)
      expect(createNotificationStub.callCount).to.eq(1)
      expect(createNotificationStub.firstCall.args[0].message).to.eq(
        'Successfully deleted 2 files and 2 folders',
      )
      expect(createNotificationStub.firstCall.args[0].severity).to.eq(SEVERITY.INFO)
      expect(createNotificationStub.firstCall.args[0].action).to.eq(
        NOTIFICATION_ACTION.NODES_REMOVED,
      )
      expect(createNotificationStub.firstCall.args[0].userId).to.eq(USER_ID)
    })

    it('test remove nodes - fail async true - no error', async () => {
      loadNodesStub.returns([{}])
      userRepoFindOneOrFailStub.throws()
      createNotificationStub.returns({})
      clearStub.returns({})

      await getInstance().removeNodes([1], true)

      expect(createNotificationStub.calledOnce).to.be.true
      expect(createNotificationStub.firstCall.args[0].message).to.eq('Error')
      expect(createNotificationStub.firstCall.args[0].severity).to.eq(SEVERITY.ERROR)
      expect(createNotificationStub.firstCall.args[0].action).to.eq(
        NOTIFICATION_ACTION.NODES_REMOVED,
      )
    })

    it('test remove nodes - fail async false', async () => {
      loadNodesStub.returns([{}])
      userRepoFindOneOrFailStub.throws()
      clearStub.returns({})

      await expect(getInstance().removeNodes([1], false)).to.be.rejectedWith(Error, '')

      expect(createNotificationStub.notCalled).to.be.true
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
      getAccessibleByIdsStub.returns([])

      const res = await getInstance().listSelectedFiles([1, 2])
      expect(res).to.deep.eq([])
    })

    it('should return accessible files', async () => {
      getAccessibleByIdsStub
        .withArgs(Node, [file1.id, folder2.id], {
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
      uid: FILE_UID1,
      scope: SPACE,
    } as unknown as UserFile
    const existingFile2 = {
      id: 2,
      uid: FILE_UID2,
      scope: SPACE,
    } as unknown as UserFile

    it('should throw error if user does not have access to target space', async () => {
      getEditableSpacesStub.returns([])
      const uid = 'file-uid-1'
      await expect(getInstance().validateCopyFiles([uid], `space-1`)).to.be.rejectedWith(
        PermissionError,
        'You do not have permission to copy files to this scope',
      )
    })

    it('should return editable files which exist in the target space', async () => {
      getEditableSpacesStub.returns(['space-1'])
      getEditableStub
        .withArgs(UserFile, {
          dxid: FILE_DXID1,
          scope: SPACE,
        })
        .returns([existingFile1])
      getEditableStub
        .withArgs(UserFile, {
          dxid: FILE_DXID2,
          scope: SPACE,
        })
        .returns([existingFile2])
      getEditableStub.withArgs(UserFile, { dxid: FILE_DXID3, scope: SPACE }).returns([])
      getNodePathStub.returns('path')

      const res = await getInstance().validateCopyFiles([FILE_UID1, FILE_UID2, FILE_UID3], SPACE)
      expect(Object.keys(res).length).to.eq(2)
    })
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
      folderRepository,
      userRepository,
      entityFetcherService,
      nodesHelper,
      entityService,
      taggingService,
      spaceEventService,
    )
  }
})
