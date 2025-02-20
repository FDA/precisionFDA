import { EMAIL_CONFIG } from '@shared/domain/email/email.config'
import { DateTime, Duration, Interval } from 'luxon'
import { createSendEmailTask } from '../../queue'
import { UserOpsCtx, WorkerOpsCtx } from '../../types'
import { config } from '../../config'
import { EMAIL_TYPES } from '../email/email.config'
import { Job } from './job.entity'
import { ACTIVE_STATES, JOB_STATE, TERMINAL_STATES } from './job.enum'

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
): Promise<void[]> => {
  const handler = new EMAIL_CONFIG.jobFailed.handlerClass(EMAIL_TYPES.jobFailed, { jobId }, ctx)
  await handler.setupContext()

  const receivers = await handler.determineReceivers()
  const emails = await Promise.all(
    receivers.map(async (receiver) => {
      return await handler.template(receiver)
    }),
  )

  return await Promise.all(
    emails.map(async (email) => {
      ctx.log.log(
        {
          jobId,
          user: ctx.user.dxuser,
          recipient: email.to,
        },
        'Sending failed job email to user',
      )

      await createSendEmailTask(email, ctx.user)
    }),
  )
}
