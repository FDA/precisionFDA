import { SqlEntityManager } from '@mikro-orm/mysql'
import { emailClientProvider } from '@shared/domain/email/email-client.provider'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { JobRepository } from '@shared/domain/job/job.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { Job } from './job.entity'

export const sendJobFailedEmails = async (jobId: number, em: SqlEntityManager): Promise<void> => {
  const emailClient = emailClientProvider.useFactory()
  const userRepo = em.getRepository(User) as UserRepository
  const jobRepo: JobRepository = em.getRepository(Job)
  const handler = new JobFailedEmailHandler(userRepo, jobRepo, emailClient)
  const inputDto = { jobId }
  await handler.sendEmail(inputDto)
}
