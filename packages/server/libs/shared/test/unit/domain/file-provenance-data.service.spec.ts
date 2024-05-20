import { SqlEntityManager } from '@mikro-orm/mysql'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Job } from '@shared/domain/job/job.entity'
import { FileProvenanceDataService } from '@shared/domain/provenance/service/entity-data/file-provenance-data.service'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('FileProvenanceDataService', () => {
  const NAME = 'name'
  const LINK = 'LINK'
  const UID = 'UID'

  const USER_ID = 1
  const USER = { id: USER_ID }

  const JOB_ID = 2
  const JOB = { id: JOB_ID }

  const COMPARISON_ID = 3
  const COMPARISON = { id: COMPARISON_ID }

  const ASSET_ID = 4
  const ASSET = { id: ASSET_ID }

  const NODE_ID = 5
  const NODE = { id: NODE_ID }

  const userFindOneStub = stub()
  const jobFindOneStub = stub()
  const comparisonFindOneStub = stub()
  const assetFindOneStub = stub()
  const nodeFindOneStub = stub()
  const getRepositoryStub = stub()
  const getEntityUiLinkStub = stub()

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    userFindOneStub.reset()
    userFindOneStub.throws()
    userFindOneStub.withArgs(USER_ID).resolves(USER)

    jobFindOneStub.reset()
    jobFindOneStub.throws()
    jobFindOneStub.withArgs(JOB_ID).resolves(JOB)

    comparisonFindOneStub.reset()
    comparisonFindOneStub.throws()
    comparisonFindOneStub.withArgs(COMPARISON_ID).resolves(COMPARISON)

    assetFindOneStub.reset()
    assetFindOneStub.throws()
    assetFindOneStub.withArgs(ASSET_ID).resolves(ASSET)

    nodeFindOneStub.reset()
    nodeFindOneStub.throws()
    nodeFindOneStub.withArgs(NODE_ID).resolves(NODE)

    getRepositoryStub.reset()
    getRepositoryStub.throws()
    getRepositoryStub.withArgs(User).returns({ findOne: userFindOneStub })
    getRepositoryStub.withArgs(Job).returns({ findOne: jobFindOneStub })
    getRepositoryStub.withArgs(Comparison).returns({ findOne: comparisonFindOneStub })
    getRepositoryStub.withArgs(Asset).returns({ findOne: assetFindOneStub })
    getRepositoryStub.withArgs(UserFile).returns({ findOne: nodeFindOneStub })

    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the file', async () => {
      const res = await getInstance().getData(getFile())

      expect(res).to.deep.equal({
        type: 'file',
        url: LINK,
        title: NAME,
        identifier: UID,
      })
    })
  })

  describe('#getParents', () => {
    it('should return no parents if no parent id', async () => {
      const res = await getInstance().getParents(getFile(null, PARENT_TYPE.USER))

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return no parents if no parent type', async () => {
      const res = await getInstance().getParents(getFile(0))

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return no parents if no parent found', async () => {
      userFindOneStub.reset()
      userFindOneStub.withArgs(USER_ID).resolves(null)

      const res = await getInstance().getParents(getFile(USER_ID, PARENT_TYPE.USER))

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return correct parent for parent type user', async () => {
      const res = await getInstance().getParents(getFile(USER_ID, PARENT_TYPE.USER))

      expect(res).to.be.an('array').and.have.length(1)
      expect(res).to.deep.include({ type: 'user', entity: USER })
    })

    it('should return correct parent for parent type job', async () => {
      const res = await getInstance().getParents(getFile(JOB_ID, PARENT_TYPE.JOB))

      expect(res).to.be.an('array').and.have.length(1)
      expect(res).to.deep.include({ type: 'job', entity: JOB })
    })

    it('should return correct parent for parent type node', async () => {
      const res = await getInstance().getParents(getFile(NODE_ID, PARENT_TYPE.NODE))

      expect(res).to.be.an('array').and.have.length(1)
      expect(res).to.deep.include({ type: 'file', entity: NODE })
    })

    it('should return correct parent for parent type comparison', async () => {
      const res = await getInstance().getParents(getFile(COMPARISON_ID, PARENT_TYPE.COMPARISON))

      expect(res).to.be.an('array').and.have.length(1)
      expect(res).to.deep.include({ type: 'comparison', entity: COMPARISON })
    })

    it('should return correct parent for parent type asset', async () => {
      const res = await getInstance().getParents(getFile(ASSET_ID, PARENT_TYPE.ASSET))

      expect(res).to.be.an('array').and.have.length(1)
      expect(res).to.deep.include({ type: 'asset', entity: ASSET })
    })
  })

  function getFile(parentId?: number, parentType?: PARENT_TYPE) {
    const file = {
      name: NAME,
      uid: UID,
      parentId,
      parentType,
    } as unknown as UserFile

    getEntityUiLinkStub.withArgs(file).resolves(LINK)
    getEntityTypeForEntityStub.withArgs(file).returns('file')

    return file
  }

  function getInstance() {
    const em = {
      getRepository: getRepositoryStub,
    } as unknown as SqlEntityManager

    const entityService = { getEntityUiLink: getEntityUiLinkStub } as unknown as EntityService

    return new FileProvenanceDataService(em, entityService)
  }
})
