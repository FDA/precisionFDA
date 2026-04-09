import { expect } from 'chai'
import { stub } from 'sinon'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { Job } from '@shared/domain/job/job.entity'
import { JobRepository } from '@shared/domain/job/job.repository'
import { Organization } from '@shared/domain/org/organization.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { EmailClient } from '@shared/services/email-client'

describe('JobFailedEmailHandler', () => {
  const JOB_ID = 10
  const USER_ID = 16

  const emailClientSendEmailStub = stub()
  const jobRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const jobRepo = {
    findOneOrFail: jobRepoFindOneOrFailStub,
  } as unknown as JobRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new JobFailedEmailHandler(userRepo, jobRepo, emailClient)
  }

  const input = new JobEventDTO()
  input.jobId = JOB_ID

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    jobRepoFindOneOrFailStub.reset()
    jobRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('cost limit exceeded', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Huli'
      user.lastName = 'Su Lina'
      user.email = 'test@email.com'
      const job = new Job(user)
      job.uid = 'job-123-1'
      job.name = 'job-name'

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      job.describe = {
        failureReason: 'CostLimitExceeded',
      } as JobDescribeResponse

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.jobFailed)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(`Execution "${job.name}" failed`)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `There was an error running execution ${job.uid}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain('due to a limit being reached')
    })

    it('job failed', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Du Ven'
      user.lastName = 'Blejt'
      user.email = 'test@email.com'
      const job = new Job(user)
      job.name = 'job-name'

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      job.describe = {
        failureReason: 'Job failed for whatever reason',
      } as JobDescribeResponse

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.equal(EMAIL_TYPES.jobFailed)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.equal(`Execution "${job.name}" failed`)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(job.describe.failureReason)
    })
  })
})
