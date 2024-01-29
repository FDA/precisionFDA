import { Job } from '@shared/domain/job/job.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  JobProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/job-provenance-data.service'

describe('JobProvenanceDataService', () => {
  const NAME = 'name'
  const UID = 'uid'

  const FILE_1_ID = 10
  const FILE_2_ID = 11

  const FILE_1 = { id: FILE_1_ID }
  const FILE_2 = { id: FILE_2_ID }
  const FILES = [FILE_1, FILE_2]

  const APP_ID = 100
  const APP = { id: APP_ID }

  const loadFilesStub = stub()
  const loadAppStub = stub()

  const JOB = {
    uid: UID,
    name: NAME,
    inputFiles: { loadItems: loadFilesStub },
    app: { load: loadAppStub },
  } as unknown as Job

  beforeEach(() => {
    loadFilesStub.reset()
    loadFilesStub.resolves(FILES)

    loadAppStub.reset()
    loadAppStub.resolves(APP)
  })

  describe('#getData', () => {
    it('should provide correct data about the job', () => {
      const res = getInstance().getData(JOB)

      expect(res).to.deep.equal({ type: 'job', url: `https://rails-host:1234/home/executions/${UID}`, title: NAME })
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
    return new JobProvenanceDataService()
  }
})
