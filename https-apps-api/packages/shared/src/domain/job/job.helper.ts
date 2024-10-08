import { DateTime, Duration, Interval } from 'luxon'
import { createSendEmailTask } from '../../queue'
import { UserOpsCtx, WorkerOpsCtx } from '../../types'
import { config } from '../../config'
import { EMAIL_TYPES } from '../email/email.config'
import { JobFailedEmailHandler } from '../email/templates/handlers'
import { Job } from './job.entity'
import { ACTIVE_STATES, JOB_STATE, TERMINAL_STATES } from './job.enum'

const isStateTerminal = (state: string): boolean =>
  Object.values(TERMINAL_STATES).includes(state as JOB_STATE)

const shouldSyncStatus = (job: Job): boolean => {
  if (isStateTerminal(job.state)) {
    // the job has already ended and PFDA knows of it
    return false
  }
  return true
}

const isJobPrivate = (job: Job): boolean => job.scope.toLowerCase() === 'private'

const isJobPublic = (job: Job): boolean => job.scope.toLowerCase() === 'public'

const isJobInSpace = (job: Job): boolean => job.scope.toLowerCase().startsWith('space')

const isStateActive = (state: string): boolean =>
  Object.values(ACTIVE_STATES).includes(state as JOB_STATE)

const buildIsOverMaxDuration = (
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
    if (currentJobInterval.toDuration() >= maxDuration) {
      return true
    }
    return false
  }
}

const formatDuration = (duration: number): string => {
  const elaspsedSeconds = Math.floor(duration / 1000)
  const days = Math.floor(elaspsedSeconds / 86400)
  const hours = (elaspsedSeconds % 86400) / 3600
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60

  let result = Math.floor(minutes) + 'm ' + Math.round(seconds) + 's'
  const hoursInt = Math.floor(hours)
  const daysInt = Math.floor(days)
  if (hoursInt) {
    result = `${hoursInt}h ${result}`
  }
  if (daysInt) {
    return `${daysInt}d ${result}`
  }
  return result
}

const sendJobFailedEmails = async (jobId:string, ctx: WorkerOpsCtx<UserOpsCtx>): Promise<void> => {
  const handler = new JobFailedEmailHandler(
    EMAIL_TYPES.jobFailed,
    { jobId},
    ctx,
  )
  await handler.setupContext()

  const receivers = await handler.determineReceivers()
  const emails = await Promise.all(
    receivers.map(async receiver => {
      const template = await handler.template(receiver)
      return template
    }),
  )

  return Promise.all(emails.map(async email => {
    ctx.log.info({
      jobId,
      user: ctx.user.dxuser,
      recipient: email.to,
    }, 'Sending failed job email to user')

    await createSendEmailTask(email, ctx.user)
  })) as any
}

export {
  shouldSyncStatus,
  isStateTerminal,
  sendJobFailedEmails,
  buildIsOverMaxDuration,
  isStateActive,
  isJobPrivate,
  isJobPublic,
  isJobInSpace,
  formatDuration,
}
