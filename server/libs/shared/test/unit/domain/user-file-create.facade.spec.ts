import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { InternalError } from '@shared/errors'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { FileCreate } from '@shared/facade/file-create/model/file-create'
import { FileCreateWithContent } from '@shared/facade/file-create/model/file-create-with-content'
import { UserCtx } from '@shared/types'

describe('UserFileCreateFacade', () => {
  const USER_ID = 0
  const USER_CTX = { id: USER_ID } as UserCtx

  const FILE_PARENT_TYPE = PARENT_TYPE.USER
  const FILE_SCOPE = STATIC_SCOPE.PRIVATE
  const DESCRIPTION = 'description'
  const STATE = FILE_STATE_DX.OPEN
  const PROJECT = 'project'
  const DXID = 'dxid'
  const NAME = 'name'

  const FILE_CREATE: FileCreate = {
    project: PROJECT,
    name: NAME,
    scope: FILE_SCOPE,
    description: DESCRIPTION,
  }

  const SERVICE_RESULT = {
    name: NAME,
    uid: `${DXID}-1`,
  } as UserFile

  const platformCreateFileStub = stub()
  const serviceCreateFileStub = stub()
  const serviceCloseFileStub = stub()
  const uploadFileContentStub = stub()

  beforeEach(() => {
    platformCreateFileStub.reset()
    platformCreateFileStub.throws()
    platformCreateFileStub
      .withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION })
      .returns({ id: DXID })

    serviceCreateFileStub.reset()
    serviceCreateFileStub.throws()
    serviceCreateFileStub
      .withArgs({
        parentId: USER_ID,
        parentType: FILE_PARENT_TYPE,
        userId: USER_ID,
        name: NAME,
        state: STATE,
        scope: FILE_SCOPE,
        project: PROJECT,
        dxid: DXID,
        description: DESCRIPTION,
      })
      .resolves(SERVICE_RESULT)

    serviceCloseFileStub.reset()
    serviceCloseFileStub.throws()
    serviceCloseFileStub.withArgs(`${DXID}-1`).resolves()

    uploadFileContentStub.reset()
    uploadFileContentStub.throws()
  })

  describe('#createFile', () => {
    it('should not catch error from platformCreateFile', async () => {
      const error = new Error('my error')
      platformCreateFileStub.reset()
      platformCreateFileStub.throws(error)

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should not catch error from serviceCreateFile', async () => {
      const error = new Error('my error')
      serviceCreateFileStub.reset()
      serviceCreateFileStub.throws(error)

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should reject if platform returns a null dxid', async () => {
      platformCreateFileStub
        .withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION })
        .returns({ id: null })

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(
        InternalError,
        'Failed to create the file on the platform',
      )
    })

    it('should reject if platform returns an empty response', async () => {
      platformCreateFileStub
        .withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION })
        .returns(undefined)

      await expect(getInstance().createFile(FILE_CREATE)).to.be.rejectedWith(
        InternalError,
        'Failed to create the file on the platform',
      )
    })

    it('should return correctly created file', async () => {
      const res = await getInstance().createFile(FILE_CREATE)

      expect(res).to.eq(SERVICE_RESULT)
    })
  })
  describe('#createFileWithContent', () => {
    const CONTENT = 'content'

    const FILE_CREATE_WITH_CONTENT: FileCreateWithContent = {
      ...FILE_CREATE,
      content: CONTENT,
    }

    beforeEach(() => {
      uploadFileContentStub.withArgs(SERVICE_RESULT, CONTENT).resolves()
    })

    it('should not catch error from uploadFileContent', async () => {
      const error = new Error('my error')
      uploadFileContentStub.reset()
      uploadFileContentStub.throws(error)

      await expect(
        getInstance().createFileWithContent(FILE_CREATE_WITH_CONTENT),
      ).to.be.rejectedWith(error)
    })

    it('should return response from the service', async () => {
      const res = await getInstance().createFileWithContent(FILE_CREATE_WITH_CONTENT)

      expect(res).to.eq(SERVICE_RESULT)
      expect(serviceCloseFileStub.calledOnce).to.be.true()
    })

    it('should upload content correctly', async () => {
      await getInstance().createFileWithContent(FILE_CREATE_WITH_CONTENT)

      expect(uploadFileContentStub.calledOnce).to.be.true()
      expect(serviceCloseFileStub.calledOnce).to.be.true()
    })
  })

  function getInstance() {
    const platformFileService = {
      createFile: platformCreateFileStub,
      uploadFileContent: uploadFileContentStub,
    } as unknown as PlatformFileService
    const userFileService = {
      createFile: serviceCreateFileStub,
      closeFile: serviceCloseFileStub,
    } as unknown as UserFileService

    return new UserFileCreateFacade(USER_CTX, platformFileService, userFileService)
  }
})
