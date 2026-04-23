import { Logger } from '@nestjs/common'
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
  const loggerLogStub = stub()

  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const jobRepo = {
    findOneOrFail: jobRepoFindOneOrFailStub,
  } as unknown as JobRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): JobFailedEmailHandler => {
    const handler = new JobFailedEmailHandler(userRepo, jobRepo, emailClient)
    ;(handler as unknown as { logger: Logger }).logger = { log: loggerLogStub } as unknown as Logger
    return handler
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

    loggerLogStub.reset()
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

    it('logs email type and subject without leaking PII', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Test'
      user.lastName = 'User'
      user.email = 'sensitive@email.com'
      const job = new Job(user)
      job.name = 'secret-job'

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      job.describe = {
        failureReason: 'Some failure',
      } as JobDescribeResponse

      const handler = getHandler()
      await handler.sendEmail(input)

      // First log: preparing — contains human-readable type name
      const preparingLog = loggerLogStub.getCall(0).firstArg as string
      expect(preparingLog).to.contain('jobFailed')
      expect(preparingLog).to.not.contain('[object Object]')
      expect(preparingLog).to.not.contain(user.email)

      // Second log: sending — contains human-readable type and subject (which includes job name)
      const sendingLog = loggerLogStub.getCall(1).firstArg as string
      expect(sendingLog).to.contain('jobFailed')
      expect(sendingLog).to.contain(job.name)
      expect(sendingLog).to.not.contain('[object Object]')
      expect(sendingLog).to.not.contain(user.email)
      expect(sendingLog).to.not.contain(user.firstName)
    })
  })
})
