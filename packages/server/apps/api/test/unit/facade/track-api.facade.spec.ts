import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { EntityUtils } from '@shared/utils/entity.utils'
import { TrackApiFacade } from 'apps/api/src/facade/track/track-api.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('TrackApiFacade', () => {
  const FILE_UID = 'file-uid-1'
  const FILE_NAME = 'name'

  const COMPARISON_ID = 1
  const COMPARISION_ID = `comparison-${COMPARISON_ID}`
  const COMPARISION_NAME = 'comparison-name'

  const getEntityProvenanceStub = stub().resolves()
  const getAccessibleByUidStub = stub().resolves()
  const getAccessibleByIdStub = stub().resolves()
  const getEntityNameStub = stub(EntityUtils, 'getEntityName')

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getAccessibleByUidStub.reset()
    getAccessibleByIdStub.reset()
    getEntityNameStub.reset()
  })

  it('should raise error if entity not found', async () => {
    getAccessibleByUidStub.rejects()

    await expect(getInstance().getProvenance(FILE_UID)).to.be.rejected
  })

  it('should call getAccessibleByUid and getProvenance with correct args', async () => {
    const file = { id: 1, name: FILE_NAME } as unknown as UserFile
    getAccessibleByUidStub.withArgs(UserFile, FILE_UID).resolves(file)
    getEntityNameStub.withArgs(file).returns(FILE_NAME)

    const res = await getInstance().getProvenance(FILE_UID)
    expect(getAccessibleByUidStub.calledOnce).to.be.true()
    expect(getEntityProvenanceStub.calledOnce).to.be.true()
    expect(res.identifier).to.be.equal(FILE_UID)
    expect(res.name).to.be.equal(FILE_NAME)
  })

  it('should call getAccessibleById and getProvenance with correct args', async () => {
    const comparison = { id: COMPARISON_ID, name: COMPARISION_NAME } as unknown as Comparison
    getAccessibleByIdStub.withArgs(Comparison, COMPARISON_ID).resolves(comparison)
    getEntityNameStub.withArgs(comparison).returns(COMPARISION_NAME)

    const res = await getInstance().getProvenance(COMPARISION_ID)
    expect(getAccessibleByIdStub.calledOnce).to.be.true()
    expect(getEntityProvenanceStub.calledOnce).to.be.true()
    expect(res.identifier).to.be.equal(COMPARISION_ID)
    expect(res.name).to.be.equal(COMPARISION_NAME)
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService
    const entityFetcherService = {
      getAccessibleByUid: getAccessibleByUidStub,
      getAccessibleById: getAccessibleByIdStub,
    } as unknown as EntityFetcherService

    return new TrackApiFacade(entityProvenanceService, entityFetcherService)
  }
})
