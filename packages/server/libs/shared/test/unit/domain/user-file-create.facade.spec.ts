import { expect } from 'chai'
import { stub } from 'sinon'
import { JobService } from '@shared/domain/job/job.service'
import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { AssetCreateDTO } from '@shared/domain/user-file/dto/asset-create.dto'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { InternalError, InvalidStateError } from '@shared/errors'
import { FileCreate } from '@shared/facade/file-create/model/file-create'
import { FileCreateWithContent } from '@shared/facade/file-create/model/file-create-with-content'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'

describe('UserFileCreateFacade', () => {
  const USER_ID = 0

  const FILE_PARENT_TYPE = PARENT_TYPE.USER
  const FILE_SCOPE = STATIC_SCOPE.PRIVATE
  const DESCRIPTION = 'description'
  const STATE = FILE_STATE_DX.OPEN
  const PROJECT = 'project-1'
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
  } as unknown as UserFile

  const platformCreateFileStub = stub()
  const serviceCreateFileStub = stub()
  const serviceCreateAssetStub = stub()
  const serviceCloseFileStub = stub()
  const uploadFileContentStub = stub()
  const checkTotalChargesLimitStub = stub()
  const getDestinationProjectIdStub = stub()
  const loadEntityStub = stub()

  beforeEach(() => {
    platformCreateFileStub.reset()
    platformCreateFileStub.throws()
    platformCreateFileStub.withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION }).returns({ id: DXID })

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
        parentFolderId: undefined,
        scopedParentFolderId: undefined,
      })
      .resolves(SERVICE_RESULT)

    serviceCreateAssetStub.reset()
    serviceCreateAssetStub.throws()

    serviceCloseFileStub.reset()
    serviceCloseFileStub.throws()
    serviceCloseFileStub.withArgs(`${DXID}-1`).resolves()

    uploadFileContentStub.reset()
    uploadFileContentStub.throws()

    checkTotalChargesLimitStub.reset()
    checkTotalChargesLimitStub.resolves()

    getDestinationProjectIdStub.reset()
    getDestinationProjectIdStub.resolves(PROJECT)

    loadEntityStub.reset()
    loadEntityStub.resolves({ id: USER_ID, getDestinationProjectId: getDestinationProjectIdStub })
  })

  describe('#saveFileToDB', () => {
    it('should not catch error from platformCreateFile', async () => {
      const error = new Error('my error')
      platformCreateFileStub.reset()
      platformCreateFileStub.throws(error)

      await expect(getInstance().saveFileToDB(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should not catch error from serviceCreateFile', async () => {
      const error = new Error('my error')
      serviceCreateFileStub.reset()
      serviceCreateFileStub.throws(error)

      await expect(getInstance().saveFileToDB(FILE_CREATE)).to.be.rejectedWith(error)
    })

    it('should reject if platform returns a null dxid', async () => {
      platformCreateFileStub.withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION }).returns({ id: null })

      await expect(getInstance().saveFileToDB(FILE_CREATE)).to.be.rejectedWith(
        InternalError,
        'Failed to create the file on the platform',
      )
    })

    it('should reject if platform returns an empty response', async () => {
      platformCreateFileStub.withArgs({ name: NAME, project: PROJECT, description: DESCRIPTION }).returns(undefined)

      await expect(getInstance().saveFileToDB(FILE_CREATE)).to.be.rejectedWith(
        InternalError,
        'Failed to create the file on the platform',
      )
    })

    it('should return correctly created file', async () => {
      const res = await getInstance().saveFileToDB(FILE_CREATE)

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

      await expect(getInstance().createFileWithContent(FILE_CREATE_WITH_CONTENT)).to.be.rejectedWith(error)
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

  describe('#createAsset', () => {
    const PATHS = ['work/tool.jar', 'usr/bin/bgzip']

    const ASSET_CREATE: AssetCreateDTO = {
      name: 'asset.tar.gz',
      description: DESCRIPTION,
      paths: PATHS,
    }

    const ASSET_RESULT = {
      name: ASSET_CREATE.name,
      uid: `${DXID}-1`,
    } as unknown as Asset

    beforeEach(() => {
      platformCreateFileStub.reset()
      platformCreateFileStub.throws()
      platformCreateFileStub
        .withArgs({ name: ASSET_CREATE.name, project: PROJECT, description: DESCRIPTION })
        .returns({ id: DXID })

      serviceCreateAssetStub.reset()
      serviceCreateAssetStub.throws()
      serviceCreateAssetStub
        .withArgs(
          {
            dxid: DXID,
            project: PROJECT,
            name: ASSET_CREATE.name,
            description: DESCRIPTION,
            userId: USER_ID,
            scope: STATIC_SCOPE.PRIVATE,
            state: STATE,
          },
          PATHS,
        )
        .resolves(ASSET_RESULT)
    })

    it('should check the total charges limit before creating', async () => {
      await getInstance().createAsset(ASSET_CREATE)

      expect(checkTotalChargesLimitStub.calledOnce).to.be.true()
    })

    it('should reject when the user has no private files project', async () => {
      getDestinationProjectIdStub.reset()
      getDestinationProjectIdStub.resolves(null)

      await expect(getInstance().createAsset(ASSET_CREATE)).to.be.rejectedWith(
        InvalidStateError,
        'User does not have access to a private files project',
      )
    })

    it('should reject if platform returns a null dxid', async () => {
      platformCreateFileStub.reset()
      platformCreateFileStub.returns({ id: null })

      await expect(getInstance().createAsset(ASSET_CREATE)).to.be.rejectedWith(
        InternalError,
        'Failed to create the asset on the platform',
      )
    })

    it('should not catch error from the create asset service', async () => {
      const error = new Error('my error')
      serviceCreateAssetStub.reset()
      serviceCreateAssetStub.throws(error)

      await expect(getInstance().createAsset(ASSET_CREATE)).to.be.rejectedWith(error)
    })

    it('should return the created asset uid as both uid and id', async () => {
      const res = await getInstance().createAsset(ASSET_CREATE)

      expect(res).to.deep.equal({ uid: `${DXID}-1`, id: `${DXID}-1` })
    })
  })

  function getInstance(): UserFileCreateFacade {
    const platformFileService = {
      createFile: platformCreateFileStub,
      uploadFileContent: uploadFileContentStub,
    } as unknown as PlatformFileService
    const nodeService = {
      createFile: serviceCreateFileStub,
      createAsset: serviceCreateAssetStub,
      closeFile: serviceCloseFileStub,
    } as unknown as NodeService
    const jobService = {} as unknown as JobService
    const userService = {
      checkTotalChargesLimit: checkTotalChargesLimitStub,
    } as unknown as UserService
    const userCtx = { id: USER_ID, loadEntity: loadEntityStub } as unknown as UserContext

    return new UserFileCreateFacade(userCtx, platformFileService, nodeService, jobService, userService)
  }
})
