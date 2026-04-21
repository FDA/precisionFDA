import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { User } from '@shared/domain/user/user.entity'
import { JobRunningNotificationFacade } from '@shared/facade/job/job-running-notification.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('JobRunningNotificationFacade', () => {
  const findAllRunningJobsStub = stub()
  const getUiLinkStub = stub()
  const sendEmailStub = stub()

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

    getUiLinkStub.reset()
    getUiLinkStub.throws()
    getUiLinkStub.callsFake(async (job: Job) => `https://pfda/home/executions/${job.id}`)

    sendEmailStub.reset()
    sendEmailStub.throws()
    sendEmailStub.resolves()
  })

  context('notifyOwnersOfRunningJobs', () => {
    it('No running jobs', async () => {
      findAllRunningJobsStub.resolves([])

      const facade = getInstance()
      await facade.notifyOwnersOfRunningJobs()

      expect(findAllRunningJobsStub.calledOnce).to.be.true()
      expect(sendEmailStub.notCalled).to.be.true()
      expect(getUiLinkStub.notCalled).to.be.true()
    })

    it('Running jobs for multiple owners', async () => {
      findAllRunningJobsStub.resolves([RUNNING_JOB_1, RUNNING_JOB_2, RUNNING_JOB_3])

      const facade = getInstance()
      await facade.notifyOwnersOfRunningJobs()

      expect(findAllRunningJobsStub.calledOnce).to.be.true()

      expect(getUiLinkStub.callCount).to.equal(3)
      expect(getUiLinkStub.getCall(0).args[0]).to.equal(RUNNING_JOB_1)
      expect(getUiLinkStub.getCall(1).args[0]).to.equal(RUNNING_JOB_2)
      expect(getUiLinkStub.getCall(2).args[0]).to.equal(RUNNING_JOB_3)

      expect(sendEmailStub.callCount).to.equal(2)

      expect(sendEmailStub.getCall(0).args[0].type).to.equal(EMAIL_TYPES.userRunningJobsReport)
      expect(sendEmailStub.getCall(0).args[0].input).to.deep.equal({
        jobOwner: getSimpleUserDTO(USER_1),
        runningJobs: [getSimpleJobDTO(RUNNING_JOB_1), getSimpleJobDTO(RUNNING_JOB_3)],
      })

      expect(sendEmailStub.getCall(1).args[0].type).to.equal(EMAIL_TYPES.userRunningJobsReport)
      expect(sendEmailStub.getCall(1).args[0].input).to.deep.equal({
        jobOwner: getSimpleUserDTO(USER_2),
        runningJobs: [getSimpleJobDTO(RUNNING_JOB_2)],
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

  function getInstance(): JobRunningNotificationFacade {
    return new JobRunningNotificationFacade(jobService, emailService, entityLinkService)
  }
})
