import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityService } from '@shared/domain/entity/entity.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { Event } from '@shared/domain/event/event.entity'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import * as queue from '@shared/queue'
import sinon, { match, restore, SinonStub, stub } from 'sinon'
import { FILE_STATE_DX, FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { Logger } from '@nestjs/common'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import * as userFileHelper from '@shared/domain/user-file/user-file.helper'
import * as eventHelper from '@shared/domain/event/event.helper'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { PermissionError } from '@shared/errors'
import { NodeHelper } from '@shared/domain/user-file/node.helper'

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
  const DXID = 'dxid'
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

  const userRepoFindOneOrFailStub = stub()
  const fileRepoFindOneOrFailStub = stub()
  const fileRepoFindOneStub = stub()
  const fileLoadIfAccessibleByUserStub = stub()
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
  const userClient = {
    fileDownloadLink: fileDownloadLinkStub,
    fileDescribe: fileDescribeStub,
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
  const entityFetcherService = {
    getAccessibleByIds: getAccessibleByIdsStub,
    getAccessibleByUid: getAccessibleByUidStub,
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
  } as unknown as UserFileRepository
  const userRepository = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const nodeRepository = {
    findOneOrFail: nodeRepoFindOneOrFailStub,
    loadIfAccessibleByUser: nodeLoadIfAccessibleByUserStub,
  } as unknown as NodeRepository

  const verboseStub = stub()
  const errorStub = stub()
  const loggerStub = {
    verbose: verboseStub,
    error: errorStub,
  } as unknown as Logger

  const transactionalStub = sinon.stub()
  const em = {
    persistAndFlush: persistAndFlushStub,
    persist: persistStub,
    getReference: getReferenceStub,
    flush: flushStub,
    transactional: transactionalStub,
  } as unknown as SqlEntityManager

  const nodesHelper = {
    getWarningsForUnclosedFiles: getWarningsForUnclosedFilesStub,
    sanitizeNodeNames: sanitizeNodeNamesStub,
    renameDuplicateFiles: renameDuplicateFilesStub,
  } as unknown as NodeHelper

  const entityService = {
    getEntityDownloadLink: getEntityDownloadLinkStub,
  } as unknown as EntityService

  let createFileSynchronizeJobTaskStub: SinonStub
  let loadNodesStub: SinonStub
  let getNodePathStub: SinonStub
  let createFileEventStub: SinonStub

  before(() => {
    stub(Reference, 'create').withArgs(USER).returns(USER)
    createFileSynchronizeJobTaskStub = stub(queue, 'createFileSynchronizeJobTask')
    getNodePathStub = stub(userFileHelper, 'getNodePath')
    loadNodesStub = stub(userFileHelper, 'loadNodes')
    createFileEventStub = stub(eventHelper, 'createFileEvent')
  })

  beforeEach(() => {
    loadNodesStub.reset()
    loadNodesStub.throws()
    getNodePathStub.reset()
    getNodePathStub.throws()

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

    fileRepoFindOneStub.reset()
    fileRepoFindOneStub.throws()

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

    transactionalStub.callsFake(async (callback) => {
      return callback(em)
    })

    getEntityDownloadLinkStub.reset()
    getEntityDownloadLinkStub.throws()

    getAccessibleByUidStub.reset()
    getAccessibleByUidStub.throws()
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
        fileUid: 'dxid-1',
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
        fileUid: 'dxid-1',
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
    const FILE = { name: FILE_NAME, uid: FILE_UID } as unknown as UserFile
    const OPTIONS = { preauthenticated: true }

    beforeEach(() => {
      getEntityDownloadLinkStub.withArgs(FILE, FILE.name, OPTIONS).resolves('LINK')
      getAccessibleByUidStub.withArgs(UserFile, FILE_UID).resolves(FILE)
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
  })

  function getInstance() {
    return new UserFileService(
      em,
      USER_CTX,
      loggerStub,
      userClient,
      challengeBotClient,
      notificationService,
      nodeRepository,
      fileRepository,
      userRepository,
      entityFetcherService,
      nodesHelper,
      entityService,
    )
  }
})
