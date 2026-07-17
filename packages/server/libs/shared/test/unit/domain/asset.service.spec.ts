import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import sinon, { SinonStub, stub } from 'sinon'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { User } from '@shared/domain/user/user.entity'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { AssetCreate } from '@shared/domain/user-file/domain/asset-create'
import { AssetService } from '@shared/domain/user-file/service/asset.service'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { ASSET_VALIDATION_ERROR, ValidationError } from '@shared/errors'

describe('AssetService', () => {
  const USER_ID = 0
  const DESCRIPTION = 'description'
  const STATE = FILE_STATE_DX.OPEN
  const PROJECT = 'project-1'
  const DXID = 'file-dxid'
  const FILE_SCOPE = STATIC_SCOPE.PRIVATE

  const getReferenceStub = stub()
  const persistAndFlushStub = stub()
  const persistStub = stub()
  const flushStub = stub()
  const emPopulateStub = stub()

  const getLicenseItemsForNodeStub = stub()
  const findAccessibleStub = stub()

  const USER = { id: USER_ID } as unknown as User

  const licensedItemRepo = {
    getLicenseItemsForNode: getLicenseItemsForNodeStub,
  } as unknown as LicensedItemRepository

  const assetRepository = {
    findAccessible: findAccessibleStub,
  } as unknown as AssetRepository

  const transactionalStub = sinon.stub()
  const em = {
    persistAndFlush: persistAndFlushStub,
    persist: persistStub,
    getReference: getReferenceStub,
    flush: flushStub,
    transactional: transactionalStub,
    populate: emPopulateStub,
  } as unknown as SqlEntityManager

  let referenceCreateStub: SinonStub

  function getInstance(): AssetService {
    return new AssetService(em, licensedItemRepo, assetRepository)
  }

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    referenceCreateStub.withArgs(USER).returns(USER)

    getReferenceStub.reset()
    getReferenceStub.throws()
    getReferenceStub.withArgs(User, USER_ID).returns(USER)

    persistAndFlushStub.reset()
    persistStub.reset()
    flushStub.reset()

    emPopulateStub.reset()
    emPopulateStub.throws()

    getLicenseItemsForNodeStub.reset()
    getLicenseItemsForNodeStub.throws()

    findAccessibleStub.reset()
    findAccessibleStub.throws()

    transactionalStub.callsFake(async callback => {
      return callback(em)
    })
  })

  afterEach(() => {
    referenceCreateStub.restore()
  })

  describe('#createAsset', () => {
    const ASSET_NAME = 'asset.tar.gz'
    const ASSET_PATHS = ['work/tool.jar', 'usr/bin/bgzip', 'noext']

    const ASSET_CREATE: AssetCreate = {
      dxid: DXID,
      project: PROJECT,
      name: ASSET_NAME,
      state: STATE,
      description: DESCRIPTION,
      userId: USER_ID,
      scope: FILE_SCOPE,
    }

    beforeEach(() => {
      persistStub.returns(em)
      flushStub.resolves()
      transactionalStub.resetHistory()
    })

    it('should not catch error from getReference', async () => {
      const error = new Error('my error')
      getReferenceStub.reset()
      getReferenceStub.throws(error)

      await expect(getInstance().createAsset(ASSET_CREATE, ASSET_PATHS)).to.be.rejectedWith(error)
    })

    it('should create the correct Asset', async () => {
      const res = await getInstance().createAsset(ASSET_CREATE, ASSET_PATHS)

      expect(res).to.be.instanceOf(Asset)
      expect(res.dxid).to.eq(DXID)
      expect(res.project).to.eq(PROJECT)
      expect(res.description).to.eq(DESCRIPTION)
      expect(res.user).to.eq(USER)
      expect(res.name).to.eq(ASSET_NAME)
      expect(res.state).to.eq(STATE)
      expect(res.parentType).to.eq(PARENT_TYPE.ASSET)
      expect(res.scope).to.eq(FILE_SCOPE)
      expect(res.uid).to.eq(`${DXID}-1`)
    })

    it('should run inside a transaction and persist the asset', async () => {
      await getInstance().createAsset(ASSET_CREATE, ASSET_PATHS)

      expect(transactionalStub.calledOnce).to.be.true()
      expect(persistStub.firstCall.args[0]).to.be.instanceOf(Asset)
    })

    it('should persist one archive entry per path with the basename as name', async () => {
      await getInstance().createAsset(ASSET_CREATE, ASSET_PATHS)

      const entries = persistStub
        .getCalls()
        .map(call => call.args[0])
        .filter(arg => arg instanceof ArchiveEntry) as ArchiveEntry[]
      expect(entries).to.have.lengthOf(ASSET_PATHS.length)
      expect(entries.map(entry => entry.path)).to.deep.eq(ASSET_PATHS)
      expect(entries.map(entry => entry.name)).to.deep.eq(['tool.jar', 'bgzip', 'noext'])
    })

    it('should store a null name for path segments of "." or ".."', async () => {
      await getInstance().createAsset(ASSET_CREATE, ['foo/..'])

      const entry = persistStub
        .getCalls()
        .map(call => call.args[0])
        .find(arg => arg instanceof ArchiveEntry) as ArchiveEntry
      expect(entry.name).to.be.undefined()
    })
  })

  describe('#listAccessibleAssets', () => {
    it('delegates to assetRepository.findAccessible and returns the result', async () => {
      const where = { user: USER_ID, scope: FILE_SCOPE }
      const options = { orderBy: { createdAt: 'DESC' } } as const
      const assets = [{ id: 1 }, { id: 2 }] as unknown as Asset[]
      findAccessibleStub.reset()
      findAccessibleStub.withArgs(where, options).resolves(assets)

      const res = await getInstance().listAccessibleAssets(where, options)

      expect(res).to.eq(assets)
      expect(findAccessibleStub.calledOnceWithExactly(where, options)).to.be.true()
    })
  })

  describe('#validateAssetRemoval', () => {
    it('has license and no app - no error', async () => {
      const asset = {
        id: 1,
        apps: {
          count: () => 0,
        },
      } as unknown as Asset
      emPopulateStub.reset()
      getLicenseItemsForNodeStub.withArgs(asset.id).returns([{}])

      await getInstance().validateAssetRemoval(asset)

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

      await getInstance().validateAssetRemoval(asset)

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

      await expect(getInstance().validateAssetRemoval(asset)).to.be.rejectedWith(
        ValidationError,
        ASSET_VALIDATION_ERROR,
      )
    })
  })
})
