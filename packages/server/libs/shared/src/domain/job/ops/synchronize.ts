import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { RequestTerminateJobOperation } from '@shared/domain/job/ops/terminate'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ClientRequestError } from '@shared/errors'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { EntityScope } from '@shared/types/common'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import {
  createSendEmailTask,
  createSyncOutputsTask,
  getMainQueue,
  removeFromEmailQueue,
  removeRepeatable,
} from '@shared/queue'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import type { Maybe, UserOpsCtx } from '@shared/types'
import { WorkerBaseOperation } from '@shared/utils/base-operation'
import { EMAIL_TYPES, EmailSendInput } from '../../email/email.config'
import { buildEmailTemplate, getBullJobIdForEmailOperation } from '../../email/email.helper'
import {
  JobStaleInputTemplate,
  jobStaleTemplate,
} from '../../email/templates/mjml/job-stale.handler'
import { createJobClosed } from '../../event/event.helper'
import { Job } from '../job.entity'
import { JOB_STATE } from '../job.enum'
import {
  buildIsOverMaxDuration,
  isStateActive,
  isStateTerminal,
  sendJobFailedEmails,
  shouldSyncStatus,
} from '../job.helper'

/**
 * Checks job status if notifications should be triggered.
 */
const checkJobStatusForNotifications = async (
  em: SqlEntityManager,
  userId: number,
  job: Job,
  remoteJob: JobDescribeResponse,
) => {
  const notificationService = new NotificationService(em)
  const meta = {
    linkTitle: 'View Execution',
    linkUrl: `/home/executions/${job.uid}`,
  }
  const sendNotification = async (
    message: string,
    severity: SEVERITY,
    action: NOTIFICATION_ACTION,
  ) => {
    await notificationService.createNotification({ message, severity, action, userId, meta })
  }

  const remoteState = remoteJob.state
  const isJobRunning = job.state !== JOB_STATE.RUNNING && remoteState === JOB_STATE.RUNNING
  const httpsAppRunning =
    remoteState === JOB_STATE.RUNNING && remoteJob?.properties?.httpsAppState === JOB_STATE.RUNNING

  if (isJobRunning && job.hasHttpsAppState() && !httpsAppRunning) {
    await sendNotification(
      `Initializing ${job.name}`,
      SEVERITY.INFO,
      NOTIFICATION_ACTION.JOB_INITIALIZING,
    )
  }

  if ((isJobRunning && !job.hasHttpsAppState()) || httpsAppRunning) {
    await sendNotification(`${job.name} is running`, SEVERITY.INFO, NOTIFICATION_ACTION.JOB_RUNNING)
  }

  if (job.state !== JOB_STATE.RUNNABLE && remoteState === JOB_STATE.RUNNABLE) {
    await sendNotification(
      `Job ${job.name} is runnable`,
      SEVERITY.INFO,
      NOTIFICATION_ACTION.JOB_RUNNABLE,
    )
  }

  if (job.state !== JOB_STATE.DONE && remoteState === JOB_STATE.DONE) {
    await sendNotification(
      `Job ${job.name} has finished`,
      SEVERITY.INFO,
      NOTIFICATION_ACTION.JOB_DONE,
    )
  }

  if (job.state !== JOB_STATE.TERMINATED && remoteState === JOB_STATE.TERMINATED) {
    await sendNotification(
      `Job ${job.name} has terminated`,
      SEVERITY.INFO,
      NOTIFICATION_ACTION.JOB_TERMINATED,
    )
  }

  if (remoteState === JOB_STATE.FAILED) {
    await sendNotification(
      `Job ${job.name} has failed`,
      SEVERITY.ERROR,
      NOTIFICATION_ACTION.JOB_FAILED,
    )
  }
}

/**
 * SyncJobOperation is responsible for synchronizing the job status with the platform.
 * Works for both https and standalone apps.
 */
export class SyncJobOperation extends WorkerBaseOperation<
  UserOpsCtx,
  CheckStatusJob['payload'],
  Maybe<Job>
> {
  protected user: User
  protected job: Job
  protected client: PlatformClient

  static getBullJobId(jobDxid: string) {
    return `${TASK_TYPE.SYNC_JOB_STATUS}.${jobDxid}`
  }

  static getJobDxidFromBullJobId(bullJobId: string) {
    return bullJobId.replace('sync_job_status.', '')
  }

  async run(input: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid }, { populate: ['app'] })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    // check input data
    if (!job) {
      this.ctx.log.error({ input }, 'SyncJobOperation: Error: Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    if (!user) {
      this.ctx.log.error({ input }, 'SyncJobOperation: Error: User does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    // todo: check user's ownership -> we should have a helper for it
    this.job = job
    this.user = user
    this.client = new PlatformClient({ accessToken: this.ctx.user.accessToken }, this.ctx.log)
    this.ctx.log.log({ jobId: job.id }, 'Processing job')

    if (!shouldSyncStatus(job)) {
      this.ctx.log.log(
        { input, job },
        'Job is already finished. Removing task from main queue',
      )
      await removeRepeatable(this.ctx.job, getMainQueue())
      this.removeTerminationEmailJob()
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.client.jobDescribe({
        jobId: input.dxid,
      })
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.ctx.log.log(
            { error: err.props },
            'Received 401 from platform, removing sync task',
          )
          await removeRepeatable(this.ctx.job)
        }
      } else {
        this.ctx.log.log(
          { error: err },
          'Unhandled error from job/describe, will retry later',
        )
      }
      return
    }

    // TODO(samuel) this shoudl be part of platform client
    delete platformJobData['sshHostKey']
    this.ctx.log.log(
      { platformJobData: platformJobData },
      'Received job/describe from platform',
    )

    const isOverNotifyMaxDuration = buildIsOverMaxDuration('notify')
    const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
    if (
      isStateActive(job.state) &&
      isOverNotifyMaxDuration(job) &&
      !isOverTerminateMaxDuration(job) &&
      !job.terminationEmailSent
    ) {
      await this.sendTerminationEmail()
      job.terminationEmailSent = true
      em.persist(job)
    }
    if (isStateActive(job.state) && isOverTerminateMaxDuration(job)) {
      this.ctx.log.log(
        { jobId: job.id, jobUid: job.uid },
        'Job marked as stale, trying to terminate',
      )
      const terminateOp = new RequestTerminateJobOperation({
        log: this.ctx.log,
        em: this.ctx.em,
        user: this.ctx.user,
      })
      await terminateOp.execute({ dxid: job.dxid })
      return
    }

    // fixme: the mapping is not perfect for the https apps
    // TODO(Zai): Figure out in what way this is not perfect and document it
    const remoteState = platformJobData.state
    // Job description is updated only if:
    // remoteState !== job.state => job's state changed
    // remoteState === JOB_STATE.RUNNING && job.hasHttpsAppState() && !job.isHttpsAppRunning()
    // => https app has not run yet
    if (
      remoteState === job.state &&
      (remoteState !== JOB_STATE.RUNNING || !job.hasHttpsAppState() || job.isHttpsAppRunning())
    ) {
      this.ctx.log.log({ remoteState }, 'State has not changed, no updates')
      return
    }

    if (isStateTerminal(remoteState)) {
      this.ctx.log.debug(
        { remoteState },
        'Remote job state is terminal, will sync folders and files',
      )
      // create jobClosed event
      // TODO: this is worth refactoring, because job.describe (that is used for event) is updated
      // with data from platformJobData later in createSyncOutputsTask
      const eventEntity = await createJobClosed(user, job, platformJobData)
      em.persist(eventEntity)

      if (remoteState === JOB_STATE.FAILED) {
        if (job.state === JOB_STATE.RUNNING) {
          // if latest known state was 'running' then platform terminated the job
          this.ctx.log.log(
            {
              jobId: input.dxid,
              failureReason: platformJobData.failureReason,
              failureMessage: platformJobData.failureMessage,
            },
            'Detected job termination by platform',
          )
        } else {
          this.ctx.log.log(
            {
              failureCounts: platformJobData.failureCounts,
              failureReason: platformJobData.failureReason,
              failureMessage: platformJobData.failureMessage,
            },
            'Detected failed job',
          )
        }
      }

      if (job.isHTTPS()) {
        // https app like JupyterLab also supports run non-interactively
        if (remoteState === JOB_STATE.DONE) {
          await createSyncOutputsTask({ dxid: job.dxid }, this.ctx.user)
        }
        await this.releaseFilesLockedByJob(em, job.dxid, job.scope)
      } else {
        await createSyncOutputsTask({ dxid: job.dxid }, this.ctx.user)
      }
    }

    await checkJobStatusForNotifications(em, this.ctx.user.id, job, platformJobData)

    this.ctx.log.log(
      {
        jobId: input.dxid,
        fromState: job.state,
        toState: remoteState,
      },
      'Updating job state and metadata from platform',
    )
    const updatedJob = wrap(job).assign(
      {
        describe: platformJobData,
        state: platformJobData.state,
      },
      { em },
    )
    await em.flush()

    // Note(samuel) email has to be sent after em. flush, otherwise failureReason won't be propagated in database
    // Alternative - pass failure reason and other
    if (remoteState === JOB_STATE.FAILED) {
      this.ctx.log.log(
        {
          failureCounts: platformJobData.failureCounts,
          failureReason: platformJobData.failureReason,
          failureMessage: platformJobData.failureMessage,
        },
        'Detected failed job',
      )

      try {
        await sendJobFailedEmails(this.job.id.toString(), this.ctx)
      } catch (e) {
        this.ctx.log.error({ job: updatedJob }, 'Failed to send emails')
      }
    }

    this.ctx.log.debug({ job: updatedJob }, 'SyncJobOperation: Updated job')
  }

  private async sendTerminationEmail(): Promise<void> {
    // send email to job owner
    const body = buildEmailTemplate<JobStaleInputTemplate>(jobStaleTemplate, {
      receiver: this.user,
      content: { job: { id: this.job.id, name: this.job.name, uid: this.job.uid } },
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.jobTerminationWarning,
      to: this.user.email,
      subject: `Job ${this.job.name} will terminate in 24 hours`,
      body,
    }
    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.jobTerminationWarning, this.job.dxid)
    this.ctx.log.log(
      {
        jobId: this.job.id,
        jobDxid: this.job.dxid,
        user: this.user.dxuser,
        recipient: this.user.email,
        bullJobId: jobId,
      },
      'Sending termination warning email to user',
    )
    await createSendEmailTask(email, this.ctx.user, jobId)
  }

  private removeTerminationEmailJob() {
    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.jobTerminationWarning, this.job.dxid)
    removeFromEmailQueue(jobId)
  }

  private async releaseFilesLockedByJob(em: SqlEntityManager, jobDxid: string, scope: EntityScope) {
    // release files if they are locked by this job
    // e.g locked by jupyterlab
    const lockedKey = `notebook-locked-by-${jobDxid}`
    const fileRepo = em.getRepository(UserFile)
    await em.transactional(async (tem) => {
      const files = await fileRepo.find(
        { scope, taggings: { tag: { name: lockedKey } } },
        { filters: ['userfile'], populate: ['taggings.tag'] },
      )

      files.forEach((file) => {
        const tagging = <Tagging>file.taggings.getItems().find((t) => t.tag.name === lockedKey)
        file.taggings.remove(tagging)
      })

      await tem.persist(files)
    })
  }
}
