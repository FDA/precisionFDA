import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { User } from '@shared/domain/user/user.entity'
import { JobStaleCheckFacade } from '@shared/facade/job/job-stale-check.facade'

describe('JobStaleCheckFacade', () => {
  const findAllRunningJobsStub = stub()
  const getUiLinkStub = stub()
  const sendEmailStub = stub()
  const populateStub = stub()

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

  const em = {
    populate: populateStub,
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

    populateStub.reset()
    populateStub.throws()
    populateStub.resolves()
  })

  context('checkAndNotifyStaleJobs', () => {
    it('No running jobs', async () => {
      findAllRunningJobsStub.resolves([])

      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()
      expect(findAllRunningJobsStub.calledOnce).to.be.true()
      expect(populateStub.notCalled).to.be.true()
      expect(sendEmailStub.notCalled).to.be.true()
      expect(getUiLinkStub.notCalled).to.be.true()
    })

    it('Stale jobs found', async () => {
      const facade = getInstance()
      await facade.checkAndNotifyStaleJobs()

      expect(findAllRunningJobsStub.calledOnce).to.be.true()
      expect(
        populateStub.calledOnceWithExactly([RUNNING_JOB_1, RUNNING_JOB_2, RUNNING_JOB_3, RUNNING_JOB_4], ['user']),
      ).to.be.true()

      expect(getUiLinkStub.callCount).to.equal(4)
      expect(getUiLinkStub.getCall(0).args[0]).to.equal(RUNNING_JOB_1)
      expect(getUiLinkStub.getCall(1).args[0]).to.equal(RUNNING_JOB_2)
      expect(getUiLinkStub.getCall(2).args[0]).to.equal(RUNNING_JOB_3)
      expect(getUiLinkStub.getCall(3).args[0]).to.equal(RUNNING_JOB_4)

      expect(sendEmailStub.callCount).to.equal(3)
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

      expect(sendEmailStub.getCall(1).args[0].type).to.equal(EMAIL_TYPES.userRunningJobsReport)
      expect(sendEmailStub.getCall(1).args[0].input).to.deep.equal({
        jobOwner: getSimpleUserDTO(USER_1),
        runningJobs: [getSimpleJobDTO(RUNNING_JOB_1), getSimpleJobDTO(RUNNING_JOB_3)],
      })

      expect(sendEmailStub.getCall(2).args[0].type).to.equal(EMAIL_TYPES.userRunningJobsReport)
      expect(sendEmailStub.getCall(2).args[0].input).to.deep.equal({
        jobOwner: getSimpleUserDTO(USER_2),
        runningJobs: [getSimpleJobDTO(RUNNING_JOB_2), getSimpleJobDTO(RUNNING_JOB_4)],
      })
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
    return new JobStaleCheckFacade(em, jobService, emailService, entityLinkService)
  }
})
