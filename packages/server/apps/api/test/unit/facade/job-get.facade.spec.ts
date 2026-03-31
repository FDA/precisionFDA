import { EntityManager } from '@mikro-orm/core'
import { JobService } from '@shared/domain/job/job.service'
import { JobGetDTO } from '@shared/domain/job/dto/job-get.dto'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { NotFoundError } from '@shared/errors'
import { JobGetFacade } from 'apps/api/src/facade/job/get-facade/job-get.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('JobGetFacade', () => {
  const JOB_UID = 'job-abc123-1' as Uid<'job'>
  const PROJECT_DXID = 'project-123' as DxId<'project'>
  const USER_ID = 101

  const getAccessibleEntityByUidStub = stub().resolves()
  const getSpaceForJobStub = stub().resolves(null)
  const getFilesByUidsStub = stub().resolves([])
  const getFilesByDxidsInProjectStub = stub().resolves([])
  const populateStub = stub().resolves()
  const mapToDTOStub = stub(JobGetDTO, 'mapToDTO')

  const userContext = { id: USER_ID } as unknown as UserContext

  beforeEach(() => {
    getAccessibleEntityByUidStub.reset()
    getSpaceForJobStub.reset()
    getFilesByUidsStub.reset()
    getFilesByUidsStub.resolves([])
    getFilesByDxidsInProjectStub.reset()
    getFilesByDxidsInProjectStub.resolves([])
    populateStub.reset()
    mapToDTOStub.reset()
  })

  after(() => {
    mapToDTOStub.restore()
  })

  it('throws NotFoundError when job does not exist or is not accessible', async () => {
    getAccessibleEntityByUidStub.withArgs(JOB_UID).resolves(null)

    await expect(getInstance().getJob(JOB_UID)).to.be.rejectedWith(NotFoundError, 'Job not found or not accessible')

    expect(populateStub.called).to.equal(false)
    expect(getFilesByUidsStub.called).to.equal(false)
    expect(getFilesByDxidsInProjectStub.called).to.equal(false)
    expect(getSpaceForJobStub.called).to.equal(false)
    expect(mapToDTOStub.called).to.equal(false)
  })

  it('populates job, resolves IO files and maps to JobGetDTO', async () => {
    const job = {
      id: 11,
      uid: JOB_UID,
      project: PROJECT_DXID,
      app: {
        getEntity: () => ({
          spec: {
            input_spec: [
              { name: 'singleInput', class: 'file' },
              { name: 'arrayInput', class: 'array:file' },
            ],
            output_spec: [
              { name: 'singleOutput', class: 'file' },
              { name: 'arrayOutput', class: 'array:file' },
            ],
          },
        }),
      },
      runData: {
        run_inputs: {
          singleInput: 'file-G111-1',
          arrayInput: ['file-G222-1', 'not-file'],
        },
        run_outputs: {
          singleOutput: 'file-G333',
          arrayOutput: ['file-G444', 1],
        },
      },
    } as unknown as { id: number; uid: Uid<'job'>; project: DxId<'project'> }
    const inputFiles = [
      { id: 1, uid: 'file-G111-1' },
      { id: 2, uid: 'file-G222-1' },
    ]
    const outputFiles = [
      { id: 3, dxid: 'file-G333' },
      { id: 4, dxid: 'file-G444' },
    ]
    const space = { id: 999 }
    const dto = { uid: JOB_UID } as JobGetDTO

    getAccessibleEntityByUidStub.withArgs(JOB_UID).resolves(job)
    getFilesByUidsStub.withArgs(['file-G111-1', 'file-G222-1']).resolves(inputFiles)
    getFilesByDxidsInProjectStub.withArgs(['file-G333', 'file-G444'], PROJECT_DXID).resolves(outputFiles)
    getSpaceForJobStub.withArgs(job).resolves(space)
    mapToDTOStub.returns(dto)

    const result = await getInstance().getJob(JOB_UID)

    expect(populateStub.calledOnceWith(job, ['user', 'app', 'app.appSeries', 'properties', 'taggings.tag'])).to.equal(
      true,
    )
    expect(getFilesByUidsStub.calledOnce).to.equal(true)
    expect(getFilesByDxidsInProjectStub.calledOnce).to.equal(true)
    expect(getSpaceForJobStub.calledOnceWith(job)).to.equal(true)
    expect(mapToDTOStub.calledOnce).to.equal(true)
    const mapToDTOArgs = mapToDTOStub.getCall(0).args
    expect(mapToDTOArgs[0]).to.equal(job)
    expect(mapToDTOArgs[1]).to.equal(userContext)
    expect(mapToDTOArgs[2].get('file-G111-1')).to.equal(inputFiles[0])
    expect(mapToDTOArgs[2].get('file-G222-1')).to.equal(inputFiles[1])
    expect(mapToDTOArgs[3].get('file-G333')).to.equal(outputFiles[0])
    expect(mapToDTOArgs[3].get('file-G444')).to.equal(outputFiles[1])
    expect(mapToDTOArgs[4]).to.equal(space)
    expect(result).to.equal(dto)
  })

  it('skips output lookup when project is missing', async () => {
    const job = {
      id: 22,
      uid: JOB_UID,
      app: {
        getEntity: (): {
          spec: {
            input_spec: Array<{ name: string; class: string }>
            output_spec: Array<{ name: string; class: string }>
          }
        } => ({
          spec: {
            input_spec: [{ name: 'singleInput', class: 'file' }],
            output_spec: [{ name: 'singleOutput', class: 'file' }],
          },
        }),
      },
      runData: {
        run_inputs: { singleInput: 'file-G111-1' },
        run_outputs: { singleOutput: 'file-G333' },
      },
    }

    getAccessibleEntityByUidStub.withArgs(JOB_UID).resolves(job)
    mapToDTOStub.returns({ uid: JOB_UID } as JobGetDTO)

    await getInstance().getJob(JOB_UID)

    expect(getFilesByUidsStub.calledOnceWithExactly(['file-G111-1'])).to.equal(true)
    expect(getFilesByDxidsInProjectStub.notCalled).to.equal(true)
  })

  function getInstance(): JobGetFacade {
    const em = {
      populate: populateStub,
    } as unknown as EntityManager

    const jobService = {
      getAccessibleEntityByUid: getAccessibleEntityByUidStub,
      getSpaceForJob: getSpaceForJobStub,
    } as unknown as JobService

    const userFileService = {
      getFilesByUids: getFilesByUidsStub,
      getFilesByDxidsInProject: getFilesByDxidsInProjectStub,
    } as unknown as UserFileService

    return new JobGetFacade(em, jobService, userFileService, userContext)
  }
})
