import { expect } from 'chai'
import { stub } from 'sinon'
import type { SqlEntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { User } from '@shared/domain/user/user.entity'
import { JobStaleCheckFacade } from '@shared/facade/job/job-stale-check.facade'
import type { PlatformClient } from '@shared/platform-client'

describe('JobStaleCheckFacade', () => {
  const findAllRunningJobsStub = stub()
  const getUiLinkStub = stub()
  const sendEmailStub = stub()
  const flushStub = stub()
  const jobDescribeStub = stub()
  const jobTerminateStub = stub()
  const projectInviteStub = stub()
  const projectLeaveStub = stub()

  const USER_1 = {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    dxuser: 'john.smith',
    email: 'john.smith@test.com',
  } as unknown as User

  const USER_2 = {
    id: 2,
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    dxuser: 'alice.johnson',
    email: 'alice.johnson@test.com',
  } as unknown as User

  const RUNNING_JOB_1 = {
    id: 101,
    dxid: 'job-101',
    name: 'Data Analysis Job 1',
    uid: 'job-uid-101',
    state: 'running',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '2d 3h',
    user: {
      id: USER_1.id,
      getEntity: (): User => USER_1,
    },
  } as unknown as Job

  const RUNNING_JOB_2 = {
    id: 102,
    dxid: 'job-102',
    name: 'Data Analysis Job 2',
    uid: 'job-uid-102',
    state: 'running',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '2d 30m',
    user: {
      id: USER_2.id,
      getEntity: (): User => USER_2,
    },
  } as unknown as Job

  const RUNNING_JOB_3 = {
    id: 103,
    dxid: 'job-103',
    name: 'Data Analysis Job 3',
    uid: 'job-uid-103',
    state: 'running',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '5h',
    user: {
      id: USER_1.id,
      getEntity: (): User => USER_1,
    },
  } as unknown as Job

  const RUNNING_JOB_4 = {
    id: 104,
    dxid: 'job-104',
    name: 'Data Analysis Job 4',
    uid: 'job-uid-104',
    state: 'running',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '30m',
    user: {
      id: USER_2.id,
      getEntity: (): User => USER_2,
    },
  } as unknown as Job

  // Jobs past the termination threshold (>30 days)
  const STALE_JOB_PAST_TERMINATE = {
    id: 201,
    dxid: 'job-201',
    name: 'Stale Job Past Terminate',
    uid: 'job-uid-201',
    state: JOB_STATE.IDLE,
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '31d',
    user: {
      id: USER_1.id,
      getEntity: (): User => USER_1,
    },
  } as unknown as Job

  const STALE_JOB_ALREADY_TERMINAL_ON_PLATFORM = {
    id: 202,
    dxid: 'job-202',
    name: 'Stale Job Already Terminal',
    uid: 'job-uid-202',
    state: JOB_STATE.RUNNING,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '35d',
    user: {
      id: USER_2.id,
      getEntity: (): User => USER_2,
    },
  } as unknown as Job

  const STALE_JOB_STUCK_TERMINATING = {
    id: 203,
    dxid: 'job-203',
    name: 'Stale Job Stuck Terminating',
    uid: 'job-uid-203',
    state: JOB_STATE.TERMINATING,
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
    elapsedTimeSinceCreationString: () => '32d',
    user: {
      id: USER_1.id,
      getEntity: (): User => USER_1,
    },
  } as unknown as Job

  const em = {
    flush: flushStub,
  } as unknown as SqlEntityManager

  const jobService = {
    findAllRunningJobs: findAllRunningJobsStub,
  } as unknown as JobService
  const emailService = {
    sendEmail: sendEmailStub,
  } as unknown as EmailService
  const entityLinkService = {
    getUiLink: getUiLinkStub,
  } as unknown as EntityLinkService
  const adminPlatformClient = {
    jobDescribe: jobDescribeStub,
    jobTerminate: jobTerminateStub,
    projectInvite: projectInviteStub,
    projectLeave: projectLeaveStub,
  } as unknown as PlatformClient

  beforeEach(() => {
    findAllRunningJobsStub.reset()
    findAllRunningJobsStub.throws()
    findAllRunningJobsStub.resolves([RUNNING_JOB_1, RUNNING_JOB_2, RUNNING_JOB_3, RUNNING_JOB_4])

    getUiLinkStub.reset()
    getUiLinkStub.throws()
    getUiLinkStub.callsFake(async (job: Job) => `https://pfda/home/executions/${job.id}`)

    sendEmailStub.reset()
    sendEmailStub.throws()
    sendEmailStub.resolves()

    flushStub.reset()
    flushStub.resolves()

    jobDescribeStub.reset()
    jobDescribeStub.resolves({ state: JOB_STATE.IDLE })

    jobTerminateStub.reset()
    jobTerminateStub.resolves({})

    projectInviteStub.reset()
    projectInviteStub.resolves({})

    projectLeaveStub.reset()
    projectLeaveStub.resolves()

    STALE_JOB_PAST_TERMINATE.state = JOB_STATE.IDLE
    STALE_JOB_ALREADY_TERMINAL_ON_PLATFORM.state = JOB_STATE.RUNNING
    STALE_JOB_STUCK_TERMINATING.state = JOB_STATE.TERMINATING
  })

  context('checkAndNotifyStaleJobs', () => {
    it('No running jobs', async () => {
      findAllRunningJobsStub.resolves([])

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()
      expect(findAllRunningJobsStub.calledOnce).to.be.true()
      expect(sendEmailStub.notCalled).to.be.true()
      expect(getUiLinkStub.notCalled).to.be.true()
    })

    it('Only non-stale running jobs', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_3, RUNNING_JOB_4])

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(findAllRunningJobsStub.calledOnce).to.be.true()
      expect(sendEmailStub.notCalled).to.be.true()
      expect(getUiLinkStub.callCount).to.equal(2)
    })

    it('Stale jobs found', async () => {
      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(findAllRunningJobsStub.calledOnce).to.be.true()

      expect(getUiLinkStub.callCount).to.equal(4)
      expect(getUiLinkStub.getCall(0).args[0]).to.equal(RUNNING_JOB_1)
      expect(getUiLinkStub.getCall(1).args[0]).to.equal(RUNNING_JOB_2)
      expect(getUiLinkStub.getCall(2).args[0]).to.equal(RUNNING_JOB_3)
      expect(getUiLinkStub.getCall(3).args[0]).to.equal(RUNNING_JOB_4)

      expect(sendEmailStub.callCount).to.equal(1)
      expect(sendEmailStub.getCall(0).args[0].type).to.equal(EMAIL_TYPES.staleJobsReport)
      expect(sendEmailStub.getCall(0).args[0].input.jobsInfo).to.deep.equal([
        {
          user: getSimpleUserDTO(USER_1),
          staleJobs: [getSimpleJobDTO(RUNNING_JOB_1)],
          nonStaleJobs: [getSimpleJobDTO(RUNNING_JOB_3)],
        },
        {
          user: getSimpleUserDTO(USER_2),
          staleJobs: [getSimpleJobDTO(RUNNING_JOB_2)],
          nonStaleJobs: [getSimpleJobDTO(RUNNING_JOB_4)],
        },
      ])
      expect(sendEmailStub.getCall(0).args[0].input.maxDuration).to.equal(
        config.workerJobs.syncJob.staleJobsTerminateAfter.toString() ?? '-1',
      )
    })

    it('No admin sync for jobs not past termination threshold', async () => {
      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()
      expect(jobDescribeStub.notCalled).to.be.true()
      expect(jobTerminateStub.notCalled).to.be.true()
    })

    it('Terminates stale jobs past termination threshold via admin client', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_3, RUNNING_JOB_4, STALE_JOB_PAST_TERMINATE])
      jobDescribeStub.resolves({ state: JOB_STATE.IDLE })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(jobDescribeStub.calledOnce).to.be.true()
      expect(jobDescribeStub.getCall(0).args[0]).to.deep.equal({
        jobDxId: STALE_JOB_PAST_TERMINATE.dxid,
      })
      expect(jobTerminateStub.calledOnce).to.be.true()
      expect(jobTerminateStub.getCall(0).args[0]).to.deep.equal({
        jobId: STALE_JOB_PAST_TERMINATE.dxid,
      })
      expect(STALE_JOB_PAST_TERMINATE.state).to.equal(JOB_STATE.TERMINATING)
    })

    it('Updates local state when platform reports job is already terminal', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_3, STALE_JOB_ALREADY_TERMINAL_ON_PLATFORM])
      jobDescribeStub.resolves({ state: JOB_STATE.FAILED })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(jobDescribeStub.calledOnce).to.be.true()
      expect(jobDescribeStub.getCall(0).args[0]).to.deep.equal({
        jobDxId: STALE_JOB_ALREADY_TERMINAL_ON_PLATFORM.dxid,
      })
      expect(jobTerminateStub.notCalled).to.be.true()
    })

    it('Syncs terminal state for job stuck in terminating when platform reports terminal', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_3, STALE_JOB_STUCK_TERMINATING])
      jobDescribeStub.resolves({ state: JOB_STATE.FAILED })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(jobDescribeStub.calledOnce).to.be.true()
      expect(jobDescribeStub.getCall(0).args[0]).to.deep.equal({
        jobDxId: STALE_JOB_STUCK_TERMINATING.dxid,
      })
      expect(jobTerminateStub.notCalled).to.be.true()
    })

    it('Skips re-termination for job already in terminating state when platform is not yet terminal', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_3, STALE_JOB_STUCK_TERMINATING])
      jobDescribeStub.resolves({ state: JOB_STATE.RUNNING })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(jobDescribeStub.calledOnce).to.be.true()
      expect(jobTerminateStub.notCalled).to.be.true()
    })

    it('Continues processing other jobs when one fails', async () => {
      const STALE_JOB_FAIL = {
        ...STALE_JOB_PAST_TERMINATE,
        id: 203,
        dxid: 'job-203',
      } as unknown as Job

      findAllRunningJobsStub.resolves([STALE_JOB_FAIL, STALE_JOB_ALREADY_TERMINAL_ON_PLATFORM])
      jobDescribeStub.onFirstCall().rejects(new Error('Platform error'))
      jobDescribeStub.onSecondCall().resolves({ state: JOB_STATE.FAILED })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(jobDescribeStub.calledTwice).to.be.true()
    })

    it('grants temporary access for private job on describe 401, retries, and leaves project', async () => {
      const privateJob = {
        ...STALE_JOB_PAST_TERMINATE,
        id: 301,
        dxid: 'job-301',
        project: 'project-private-301',
        state: JOB_STATE.IDLE,
      } as unknown as Job

      findAllRunningJobsStub.resolves([privateJob])
      jobDescribeStub.onFirstCall().rejects({ props: { clientStatusCode: 401 } })
      jobDescribeStub.onSecondCall().resolves({ state: JOB_STATE.IDLE })

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(
        projectInviteStub.calledOnceWithExactly(
          'project-private-301',
          `user-${config.platform.adminUser}`,
          'CONTRIBUTE',
        ),
      ).to.be.true()
      expect(jobDescribeStub.calledTwice).to.be.true()
      expect(jobTerminateStub.calledOnceWithExactly({ jobId: 'job-301' })).to.be.true()
      expect(projectLeaveStub.calledOnceWithExactly({ projectDxid: 'project-private-301' })).to.be.true()
    })

    it('retries terminate on 401 with temporary access and leaves project', async () => {
      const privateJob = {
        ...STALE_JOB_PAST_TERMINATE,
        id: 302,
        dxid: 'job-302',
        project: 'project-private-302',
        state: JOB_STATE.IDLE,
      } as unknown as Job

      findAllRunningJobsStub.resolves([privateJob])
      jobDescribeStub.resolves({ state: JOB_STATE.IDLE })
      jobTerminateStub.onFirstCall().rejects({ props: { clientStatusCode: 401 } })
      jobTerminateStub.onSecondCall().resolves({})

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(
        projectInviteStub.calledOnceWithExactly(
          'project-private-302',
          `user-${config.platform.adminUser}`,
          'CONTRIBUTE',
        ),
      ).to.be.true()
      expect(jobTerminateStub.calledTwice).to.be.true()
      expect(projectLeaveStub.calledOnceWithExactly({ projectDxid: 'project-private-302' })).to.be.true()
      expect(privateJob.state).to.equal(JOB_STATE.TERMINATING)
    })
  })

  function getSimpleUserDTO(user: User): SimpleUserDTO {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      dxuser: user.dxuser,
    } as unknown as SimpleUserDTO
  }

  function getSimpleJobDTO(job: Job): SimpleJobDTO {
    return {
      name: job.name,
      uid: job.uid,
      state: job.state,
      duration: job.elapsedTimeSinceCreationString(),
      link: `https://pfda/home/executions/${job.id}`,
    } as unknown as SimpleJobDTO
  }

  function getInstance(): JobStaleCheckFacade {
    return new JobStaleCheckFacade(jobService, emailService, entityLinkService, em, adminPlatformClient)
  }
})
