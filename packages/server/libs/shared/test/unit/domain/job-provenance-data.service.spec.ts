import { EntityService } from '@shared/domain/entity/entity.service'
import { Job } from '@shared/domain/job/job.entity'
import { JobProvenanceDataService } from '@shared/domain/provenance/service/entity-data/job-provenance-data.service'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('JobProvenanceDataService', () => {
  const NAME = 'name'
  const LINK = 'LINK'
  const UID = 'UID'

  const FILE_1_ID = 10
  const FILE_2_ID = 11

  const FILE_1 = { id: FILE_1_ID }
  const FILE_2 = { id: FILE_2_ID }
  const FILES = [FILE_1, FILE_2]

  const APP_ID = 100
  const APP = { id: APP_ID }

  const loadFilesStub = stub()
  const loadAppStub = stub()
  const getEntityLinkStub = stub()

  const JOB = {
    name: NAME,
    inputFiles: { loadItems: loadFilesStub },
    app: { load: loadAppStub },
    uid: UID,
  } as unknown as Job

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    loadFilesStub.reset()
    loadFilesStub.resolves(FILES)

    loadAppStub.reset()
    loadAppStub.resolves(APP)

    getEntityLinkStub.reset()
    getEntityLinkStub.throws()
    getEntityLinkStub.withArgs(JOB).resolves(LINK)

    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
    getEntityTypeForEntityStub.withArgs(JOB).returns('job')
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('#getData', () => {
    it('should provide correct data about the job', async () => {
      const res = await getInstance().getData(JOB)

      expect(res).to.deep.equal({
        type: 'job',
        url: LINK,
        title: NAME,
        identifier: UID,
      })
    })
  })

  describe('#getParents', () => {
    it('should return no parents if no input files and no app', async () => {
      loadFilesStub.reset()
      loadFilesStub.resolves([])

      loadAppStub.reset()
      loadAppStub.resolves(null)

      const res = await getInstance().getParents(JOB)

      expect(res).to.be.an('array').and.to.be.empty()
    })

    it('should return only input files as parents if no app', async () => {
      loadAppStub.reset()
      loadAppStub.resolves(null)

      const res = await getInstance().getParents(JOB)

      expect(res).to.be.an('array').with.length(2)
      expect(res).to.deep.include({ type: 'file', entity: FILE_1 })
      expect(res).to.deep.include({ type: 'file', entity: FILE_2 })
    })

    it('should return only app as parent if no input files', async () => {
      loadFilesStub.reset()
      loadFilesStub.resolves([])

      const res = await getInstance().getParents(JOB)

      expect(res).to.be.an('array').with.length(1)
      expect(res).to.deep.include({ type: 'app', entity: APP })
    })

    it('should return input files and app as parents', async () => {
      const res = await getInstance().getParents(JOB)

      expect(res).to.be.an('array').with.length(3)
      expect(res).to.deep.include({ type: 'file', entity: FILE_1 })
      expect(res).to.deep.include({ type: 'file', entity: FILE_2 })
      expect(res).to.deep.include({ type: 'app', entity: APP })
    })
  })

  function getInstance() {
    const entityService = { getEntityLink: getEntityLinkStub } as unknown as EntityService

    return new JobProvenanceDataService(entityService)
  }
})
