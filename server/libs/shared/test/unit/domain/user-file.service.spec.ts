import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserFileCreate } from '@shared/domain/user-file/domain/user-file-create'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import * as queue from '@shared/queue'
import { match, restore, SinonStub, stub } from 'sinon'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '@shared/enums'
import { Logger } from '@nestjs/common'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'

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
  const flushStub = stub()

  const userRepoFindOneOrFailStub = stub()
  const fileRepoFindOneOrFailStub = stub()
  const fileRepoFindOneStub = stub()
  const fileLoadIfAccessibleByUserStub = stub()
  const nodeRepoFindOneOrFailStub = stub()
  const nodeLoadIfAccessibleByUserStub = stub()
  const resourceFindResourcesByFileUidStub = stub()

  const isSiteAdminStub = stub()
  const isChallengeAdminStub = stub()

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
  const resourceRepository = {
    findResourcesByFileUid: resourceFindResourcesByFileUidStub,
  } as unknown as ResourceRepository

  const verboseStub = stub()
  const errorStub = stub()
  const loggerStub = {
    verbose: verboseStub,
    error: errorStub,
  } as unknown as Logger

  let createFileSynchronizeJobTaskStub: SinonStub

  before(() => {
    stub(Reference, 'create').withArgs(USER).returns(USER)
    createFileSynchronizeJobTaskStub = stub(queue, 'createFileSynchronizeJobTask')
  })

  beforeEach(() => {
    getReferenceStub.reset()
    getReferenceStub.throws()
    getReferenceStub.withArgs(User, USER_ID).returns(USER)

    fileLoadIfAccessibleByUserStub.reset()
    fileLoadIfAccessibleByUserStub.throws()

    fileRepoFindOneOrFailStub.reset()
    fileRepoFindOneOrFailStub.throws()

    fileRepoFindOneStub.reset()
    fileRepoFindOneStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
    userRepoFindOneOrFailStub.withArgs(USER_ID).returns(USER)

    nodeLoadIfAccessibleByUserStub.reset()
    nodeLoadIfAccessibleByUserStub.throws()

    createFileSynchronizeJobTaskStub.reset()
    createFileSynchronizeJobTaskStub.throws()

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
        expect(error.message).to.eq(`File ${UID} is not in open state`)
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

  describe('#updateResourceUrl', () => {
    it('should update resource url', async () => {
      const userFile = {
        dxid: DXID,
        name: NAME,
        project: PROJECT,
      } as unknown as UserFile
      const userFileEntity = {
        getEntity: () => userFile,
      }
      const resource = {
        id: 111,
        userFile: userFileEntity,
      }
      const response = {
        url: 'http://example.com',
      }
      fileDownloadLinkStub.returns(response)
      resourceFindResourcesByFileUidStub.returns([resource])

      await getInstance().updateResourceUrl(UID)

      expect(fileDownloadLinkStub.calledOnce).to.be.true
      expect(createNotificationStub.calledOnce).to.be.true
      expect(createNotificationStub.firstCall.args[0]).deep.eq({
        message: `Resource ${resource.id} updated with url ${response.url}`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.RESOURCE_URL_UPDATED,
        userId: USER.id,
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

  function getInstance() {
    const em = {
      persistAndFlush: persistAndFlushStub,
      getReference: getReferenceStub,
      flush: flushStub,
    } as unknown as SqlEntityManager

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
      resourceRepository,
    )
  }
})
