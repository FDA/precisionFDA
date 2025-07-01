import { DateTime, Duration, Interval } from 'luxon'
import { UserOpsCtx, WorkerOpsCtx } from '../../types'
import { config } from '../../config'
import { Job } from './job.entity'
import { ACTIVE_STATES, JOB_STATE, TERMINAL_STATES } from './job.enum'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { emailClientProvider } from '@shared/domain/email/email-client.provider'
import { User } from '@shared/domain/user/user.entity'
import { JobRepository } from '@shared/domain/job/job.repository'
import { UserRepository } from '@shared/domain/user/user.repository'

export const isStateTerminal = (state: string): boolean =>
  Object.values(TERMINAL_STATES).includes(state as JOB_STATE)

export const shouldSyncStatus = (job: Job): boolean => !isStateTerminal(job.state)

export const isStateActive = (state: string): boolean =>
  Object.values(ACTIVE_STATES).includes(state as JOB_STATE)

export const buildIsOverMaxDuration = (
  terminateOrNotify: 'terminate' | 'notify',
): ((job: Job) => boolean) => {
  // which config setting to use
  const seconds =
    terminateOrNotify === 'terminate'
      ? config.workerJobs.syncJob.staleJobsTerminateAfter
      : config.workerJobs.syncJob.staleJobsEmailAfter
  const maxDuration = Duration.fromObject({
    seconds: typeof seconds === 'string' ? parseInt(seconds) : seconds,
  })
  const current = DateTime.now()
  return (job: Job): boolean => {
    const createdAt = DateTime.fromJSDate(job.createdAt)
    const currentJobInterval = Interval.fromDateTimes(createdAt, current)
    return currentJobInterval.toDuration() >= maxDuration
  }
}

export const sendJobFailedEmails = async (
  jobId: number,
  ctx: WorkerOpsCtx<UserOpsCtx>,
): Promise<void> => {
  const emailClient = emailClientProvider.useFactory()
  const userRepo = ctx.em.getRepository(User) as UserRepository
  const jobRepo: JobRepository = ctx.em.getRepository(Job)
  const handler = new JobFailedEmailHandler(userRepo, jobRepo, emailClient)
  const inputDto = { jobId }
  await handler.sendEmail(inputDto)
}
