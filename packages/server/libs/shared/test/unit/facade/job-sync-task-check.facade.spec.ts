import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { JobSyncTaskCheckFacade } from '@shared/facade/job/job-sync-task-check.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import * as queueUtils from '@shared/queue/queue.utils'
import { generate } from '@shared/test'
import { fakes, mocksReset, mocksRestore } from '@shared/test/mocks'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('JobSyncTaskCheckFacade', () => {
  const findRunningJobsByUserStub = stub()
  const createSyncJobStatusTaskStub = stub()

  let getBullJobIdStub: SinonStub
  let isJobOrphanedStub: SinonStub

  const USER_CONTEXT = {
    id: 1,
    dxuser: 'test-user',
  } as unknown as UserContext

  const JOB_1 = {
    id: 1,
    dxid: 'job-123',
    state: JOB_STATE.RUNNING,
  } as unknown as Job
  const JOB_2 = {
    id: 2,
    dxid: 'job-456',
    state: JOB_STATE.RUNNING,
  } as unknown as Job
  const JOB_3 = {
    id: 3,
    dxid: 'job-789',
    state: JOB_STATE.RUNNING,
  } as unknown as Job

  const BULL_JOB_ID_1 = `sync_job_status.${JOB_1.dxid}`
  const BULL_JOB_ID_2 = `sync_job_status.${JOB_2.dxid}`
  const BULL_JOB_ID_3 = `sync_job_status.${JOB_3.dxid}`

  const BULL_JOB_2 = generate.bullQueueRepeatable.syncJobStatus(JOB_2.dxid)
  const BULL_JOB_3 = generate.bullQueueRepeatable.syncJobStatus(JOB_3.dxid)

  const jobService = {
    findRunningJobsByUser: findRunningJobsByUserStub,
  } as unknown as JobService

  const mainQueueJobProducer = {
    createSyncJobStatusTask: createSyncJobStatusTaskStub,
  } as unknown as MainQueueJobProducer

  before(() => {
    getBullJobIdStub = stub(JobSynchronizationService, 'getBullJobId')
    isJobOrphanedStub = stub(queueUtils, 'isJobOrphaned')
  })

  beforeEach(() => {
    mocksReset()

    getBullJobIdStub.reset()
    getBullJobIdStub
      .withArgs(JOB_1.dxid)
      .returns(BULL_JOB_ID_1)
      .withArgs(JOB_2.dxid)
      .returns(BULL_JOB_ID_2)
      .withArgs(JOB_3.dxid)
      .returns(BULL_JOB_ID_3)

    fakes.queue.findRepeatableFake
      .withArgs(BULL_JOB_ID_1)
      .resolves(undefined)
      .withArgs(BULL_JOB_ID_2)
      .resolves(BULL_JOB_2)
      .withArgs(BULL_JOB_ID_3)
      .resolves(BULL_JOB_3)

    isJobOrphanedStub.reset()
    isJobOrphanedStub.withArgs(BULL_JOB_2).returns(false).withArgs(BULL_JOB_3).returns(true)

    findRunningJobsByUserStub.reset()
    findRunningJobsByUserStub.resolves([JOB_1, JOB_2, JOB_3])

    createSyncJobStatusTaskStub.reset()
    createSyncJobStatusTaskStub.resolves()
  })

  after(() => {
    mocksRestore()
    getBullJobIdStub.restore()
    isJobOrphanedStub.restore()
  })

  context('recreateJobSyncIfMissing', () => {
    it('No non-terminal jobs', async () => {
      findRunningJobsByUserStub.resolves([])

      await getInstance().recreateJobSyncIfMissing()
      expect(findRunningJobsByUserStub.calledOnce).to.be.true()
      expect(createSyncJobStatusTaskStub.notCalled).to.be.true()
    })

    it('Recreates missing job sync task', async () => {
      await getInstance().recreateJobSyncIfMissing()

      expect(findRunningJobsByUserStub.calledOnce).to.be.true()

      expect(getBullJobIdStub.callCount).to.equal(3)
      expect(getBullJobIdStub.getCall(0).args[0]).to.equal(JOB_1.dxid)
      expect(getBullJobIdStub.getCall(1).args[0]).to.equal(JOB_2.dxid)
      expect(getBullJobIdStub.getCall(2).args[0]).to.equal(JOB_3.dxid)

      expect(fakes.queue.findRepeatableFake.callCount).to.equal(3)
      expect(fakes.queue.findRepeatableFake.getCall(0).args[0]).to.equal(BULL_JOB_ID_1)
      expect(fakes.queue.findRepeatableFake.getCall(1).args[0]).to.equal(BULL_JOB_ID_2)
      expect(fakes.queue.findRepeatableFake.getCall(2).args[0]).to.equal(BULL_JOB_ID_3)

      expect(createSyncJobStatusTaskStub.callCount).to.equal(2)
      expect(createSyncJobStatusTaskStub.getCall(0).args[0]).to.deep.equal({ dxid: JOB_1.dxid })
      expect(createSyncJobStatusTaskStub.getCall(0).args[1]).to.equal(USER_CONTEXT)
      expect(createSyncJobStatusTaskStub.getCall(1).args[0]).to.deep.equal({ dxid: JOB_3.dxid })
      expect(createSyncJobStatusTaskStub.getCall(1).args[1]).to.equal(USER_CONTEXT)

      expect(fakes.queue.removeRepeatableJobsFake.calledOnce).to.be.true()
      expect(fakes.queue.removeRepeatableJobsFake.getCall(0).args[0]).to.equal(BULL_JOB_3)
    })
  })

  function getInstance(): JobSyncTaskCheckFacade {
    return new JobSyncTaskCheckFacade(USER_CONTEXT, jobService, mainQueueJobProducer)
  }
})
