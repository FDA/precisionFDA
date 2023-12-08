import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { restore, stub } from 'sinon'
import { User } from '../../../src/domain'
import { UserFileService } from '../../../src/domain/user-file'
import { UserFileCreate } from '../../../src/domain/user-file/domain/user-file-create'
import { FILE_STATE_DX, PARENT_TYPE } from '../../../src/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '../../../src/enums'

describe('UserFileService', () => {
  const USER_ID = 0
  const USER = { id: USER_ID }

  const PARENT_ID = 10
  const FILE_PARENT_TYPE = PARENT_TYPE.USER
  const PARENT_FOLDER_ID = 20
  const SCOPED_PARENT_FOLDER_ID = 30
  const FILE_SCOPE = STATIC_SCOPE.PRIVATE
  const DESCRIPTION = 'description'
  const STATE = FILE_STATE_DX.OPEN
  const PROJECT = 'project'
  const DXID = 'dxid'
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

  before(() => {
    stub(Reference, 'create').withArgs(USER).returns(USER)
  })

  beforeEach(() => {
    getReferenceStub.reset()
    getReferenceStub.throws()
    getReferenceStub.withArgs(User, USER_ID).returns(USER)

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

  function getInstance() {
    const em = {
      persistAndFlush: persistAndFlushStub,
      getReference: getReferenceStub,
    } as unknown as SqlEntityManager

    return new UserFileService(em)
  }
})
