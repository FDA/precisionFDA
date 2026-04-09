import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { NotFoundError } from '@shared/errors'
import { CliTerminateJobFacade } from '../../../src/facade/cli/cli-terminate-job.facade'

const JOB_UID = 'job-Gxxxxxxxxxxxxxxxx-1' as Uid<'job'>
const JOB_DXID = 'job-Gxxxxxxxxxxxxxxxx' as DxId<'job'>

function createJob(): Partial<Job> {
  return { uid: JOB_UID, dxid: JOB_DXID }
}

describe('CliTerminateJobFacade', () => {
  let getEditableEntityByUidStub: SinonStub
  let requestTerminateJobStub: SinonStub
  let facade: CliTerminateJobFacade

  beforeEach(() => {
    getEditableEntityByUidStub = stub().resolves(createJob())
    requestTerminateJobStub = stub().resolves({})

    const jobService = {
      getEditableEntityByUid: getEditableEntityByUidStub,
    } as unknown as JobService

    const jobSynchronizationService = {
      requestTerminateJob: requestTerminateJobStub,
    } as unknown as JobSynchronizationService

    facade = new CliTerminateJobFacade(jobService, jobSynchronizationService)
  })

  it('looks up the job by UID', async () => {
    await facade.terminateJob(JOB_UID)

    expect(getEditableEntityByUidStub.calledOnce).to.be.true()
    expect(getEditableEntityByUidStub.firstCall.args[0]).to.equal(JOB_UID)
  })

  it('calls requestTerminateJob with the job dxid', async () => {
    await facade.terminateJob(JOB_UID)

    expect(requestTerminateJobStub.calledOnce).to.be.true()
    expect(requestTerminateJobStub.firstCall.args[0]).to.equal(JOB_DXID)
  })

  it('throws NotFoundError when job is not found', async () => {
    getEditableEntityByUidStub.resolves(null)

    try {
      await facade.terminateJob(JOB_UID)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).to.be.instanceOf(NotFoundError)
      expect((err as Error).message).to.include(JOB_UID)
    }
  })

  it('does not call requestTerminateJob when job is not found', async () => {
    getEditableEntityByUidStub.resolves(null)

    try {
      await facade.terminateJob(JOB_UID)
    } catch {
      // expected
    }

    expect(requestTerminateJobStub.called).to.be.false()
  })

  it('resolves with void on success', async () => {
    const result = await facade.terminateJob(JOB_UID)

    expect(result).to.be.undefined()
  })
})
