import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { JobFinishedEmailHandler } from '@shared/domain/email/templates/handlers/job-finished.handler'
import { UserRepository } from '@shared/domain/user/user.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { EmailClient } from '@shared/services/email-client'
import { stub } from 'sinon'
import { Organization } from '@shared/domain/org/org.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'

describe('JobFinishedEmailHandler', () => {
  const JOB_ID = 12
  const USER_ID = 16

  const emailClientSendEmailStub = stub()
  const jobRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const em = {} as unknown as SqlEntityManager
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
    return new JobFinishedEmailHandler(em, userRepo, jobRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    jobRepoFindOneOrFailStub.reset()
    jobRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('private', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Piivoa'
      user.lastName = 'Rumpijem'
      user.email = 'test@email.com'
      const job = new Job(user)
      job.id = JOB_ID
      job.uid = `job-${JOB_ID}-1`
      job.name = 'job-name'
      job.scope = STATIC_SCOPE.PRIVATE

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      const input = new JobEventDTO()
      input.jobId = JOB_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.jobFinished)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `Execution ${job.name} finished`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(`Hello ${user.firstName}`)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'An execution on precisionFDA has finished successfully.',
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/home/jobs/${job.uid}`,
      )
    })

    it('public', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Prujem'
      user.lastName = 'Serekrem'
      user.email = 'test@email.com'
      const job = new Job(user)
      job.id = JOB_ID
      job.uid = `job-${JOB_ID}-1`
      job.name = 'job-name'
      job.scope = STATIC_SCOPE.PUBLIC

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      const input = new JobEventDTO()
      input.jobId = JOB_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.called).to.be.false()
    })

    it('in a space', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Nastvan'
      user.lastName = 'Kulemahazi'
      user.email = 'test@email.com'
      const job = new Job(user)
      job.id = JOB_ID
      job.uid = `job-${JOB_ID}-1`
      job.name = 'job-name'
      job.scope = 'space-1'

      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }).resolves(job)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      const input = new JobEventDTO()
      input.jobId = JOB_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.called).to.be.false()
    })
  })
})
