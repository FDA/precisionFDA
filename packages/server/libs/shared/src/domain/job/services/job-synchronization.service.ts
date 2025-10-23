import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import {
  JobFinishedInputTemplate,
  jobFinishedTemplate,
} from '@shared/domain/email/templates/mjml/job-finished.template'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { JobRepository } from '@shared/domain/job/job.repository'
import { RequestTerminateJobOperation } from '@shared/domain/job/ops/terminate'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ClientRequestError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import {
  createSendEmailTask,
  createSyncOutputsTask,
  getMainQueue,
  removeFromEmailQueue,
  removeRepeatable,
} from '@shared/queue'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import { Maybe } from '@shared/types'
import { EntityScope } from '@shared/types/common'
import { Job as BullJob } from 'bull'
import { EmailSendInput } from '../../email/email.config'
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
 * JobSynchronizationService is responsible for synchronizing the job status with the platform.
 * Works for both https and standalone apps.
 *
 * Still work in progress - it was moved from a bunch of functions in synchronize.ts into a service, but
 * the service itself could use some refactoring to make it more readable and reusable within the service.
 *
 * Challenge bot jobs synchronization is implemented in ChallengeJobSynchronizationService.
 */
@Injectable()
export class JobSynchronizationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly notificationService: NotificationService,
    private readonly jobRepo: JobRepository,
    private readonly platformClient: PlatformClient,
  ) {}

  static getBullJobId(jobDxid: string): string {
    return `${TASK_TYPE.SYNC_JOB_STATUS}.${jobDxid}`
  }

  static getJobDxidFromBullJobId(bullJobId: string): string {
    return bullJobId.replace('sync_job_status.', '')
  }

  async synchronizeJob(jobDxid: DxId<'job'>, bullJob: BullJob): Promise<Maybe<Job>> {
    const job = await this.jobRepo.findOne({ dxid: jobDxid }, { populate: ['app'] })
    const user = await this.userCtx.loadEntity()

    // check input data
    if (!job) {
      this.logger.error({ jobDxid }, 'Job does not exist')
      await removeRepeatable(bullJob)
      return
    }

    if (!user) {
      this.logger.error({ userId: this.userCtx.id }, 'User does not exist')
      await removeRepeatable(bullJob)
      return
    }

    this.logger.log({ jobId: job.id }, 'Processing job')

    if (!shouldSyncStatus(job)) {
      this.logger.log({ job, bullJob }, 'Job is already finished. Removing task from main queue')
      await removeRepeatable(bullJob, getMainQueue())
      this.removeTerminationEmailJob(jobDxid)
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.platformClient.jobDescribe({
        jobId: jobDxid,
      })
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
          await removeRepeatable(bullJob)
        }
      } else {
        this.logger.log({ error: err }, 'Unhandled error from job/describe, will retry later')
      }
      return
    }

    // TODO(samuel) this shoudl be part of platform client
    delete platformJobData['sshHostKey']
    this.logger.log({ platformJobData: platformJobData }, 'Received job/describe from platform')

    const isOverNotifyMaxDuration = buildIsOverMaxDuration('notify')
    const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
    if (
      isStateActive(job.state) &&
      isOverNotifyMaxDuration(job) &&
      !isOverTerminateMaxDuration(job) &&
      !job.terminationEmailSent
    ) {
      await this.sendTerminationEmail(user, job)
      job.terminationEmailSent = true
      this.em.persist(job)
    }
    if (isStateActive(job.state) && isOverTerminateMaxDuration(job)) {
      this.logger.log(
        { jobId: job.id, jobUid: job.uid },
        'Job marked as stale, trying to terminate',
      )

      const terminateOp = new RequestTerminateJobOperation({
        log: this.logger,
        em: this.em,
        user: this.userCtx,
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
      this.logger.log({ remoteState }, 'State has not changed, no updates')
      return
    }

    if (isStateTerminal(remoteState)) {
      this.logger.debug(
        { remoteState },
        'Remote job state is terminal, will sync folders and files',
      )
      // create jobClosed event
      // TODO: this is worth refactoring, because job.describe (that is used for event) is updated
      // with data from platformJobData later in createSyncOutputsTask
      const eventEntity = await createJobClosed(user, job, platformJobData)
      this.em.persist(eventEntity)

      if (remoteState === JOB_STATE.FAILED) {
        if (job.state === JOB_STATE.RUNNING) {
          // if latest known state was 'running' then platform terminated the job
          this.logger.log(
            {
              jobId: jobDxid,
              failureReason: platformJobData.failureReason,
              failureMessage: platformJobData.failureMessage,
            },
            'Detected job termination by platform',
          )
        } else {
          this.logger.log(
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
          await createSyncOutputsTask({ dxid: job.dxid }, this.userCtx)
        }
        await this.releaseFilesLockedByJob(this.em, job.dxid, job.scope)
      } else {
        await createSyncOutputsTask({ dxid: job.dxid }, this.userCtx)
      }
    }

    await this.checkJobStatusForNotifications(job, platformJobData)

    this.logger.log(
      {
        jobId: jobDxid,
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
      { em: this.em },
    )
    await this.em.flush()

    // Note(samuel) email has to be sent after em. flush, otherwise failureReason won't be propagated in database
    // Alternative - pass failure reason and other
    if (remoteState === JOB_STATE.FAILED) {
      this.logger.log(
        {
          failureCounts: platformJobData.failureCounts,
          failureReason: platformJobData.failureReason,
          failureMessage: platformJobData.failureMessage,
        },
        'Detected failed job',
      )

      if (!job.terminationEmailSent) {
        try {
          await sendJobFailedEmails(job.id, this.em)
          job.terminationEmailSent = true
        } catch (e) {
          this.logger.error({ job: updatedJob }, 'Failed to send emails', e)
        }
      }
    }

    if (remoteState === JOB_STATE.DONE && !job.terminationEmailSent) {
      await this.sendJobFinishedEmail(user, job)
      job.terminationEmailSent = true
    }

    this.logger.debug({ job: updatedJob }, 'Updated job')
    await this.em.flush()
  }

  private async sendTerminationEmail(
    user: User,
    checkStatusJob: CheckStatusJob['payload'],
  ): Promise<void> {
    // send email to job owner
    const body = buildEmailTemplate<JobStaleInputTemplate>(jobStaleTemplate, {
      receiver: user,
      content: {
        // TODO LUDVIK - NONE OF THESE PROPERTIES EXIST IN CheckStatusJob['payload'] and TypeScript doesn't care here ???.
        job: { id: checkStatusJob.id, name: checkStatusJob.name, uid: checkStatusJob.uid },
      },
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.jobTerminationWarning,
      to: user.email,
      subject: `Job ${checkStatusJob.name} will terminate in 24 hours`,
      body,
    }
    const jobId = getBullJobIdForEmailOperation(
      EMAIL_TYPES.jobTerminationWarning,
      checkStatusJob.dxid,
    )
    this.logger.log(
      {
        jobId: checkStatusJob.id,
        jobDxid: checkStatusJob.dxid,
        user: user.dxuser,
        recipient: checkStatusJob.email,
        bullJobId: jobId,
      },
      'Sending termination warning email to user',
    )
    await createSendEmailTask(email, this.userCtx, jobId)
  }

  private async sendJobFinishedEmail(user: User, job: Job): Promise<void> {
    const body = buildEmailTemplate<JobFinishedInputTemplate>(jobFinishedTemplate, {
      receiver: user,
      content: {
        job: { id: job.id, name: job.name, uid: job.uid },
      },
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.jobTerminationWarning,
      to: user.email,
      subject: `Execution ${job.name} completed successfully`,
      body,
    }
    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.jobFinished, job.dxid)
    this.logger.log(
      {
        jobId: job.id,
        jobDxid: job.dxid,
        user: user.dxuser,
        recipient: user.email,
        bullJobId: jobId,
      },
      'Sending job finished email to user',
    )
    await createSendEmailTask(email, this.userCtx, jobId)
  }

  private removeTerminationEmailJob(jobDxid: DxId<'job'>): void {
    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.jobTerminationWarning, jobDxid)
    removeFromEmailQueue(jobId)
  }

  private async releaseFilesLockedByJob(
    em: SqlEntityManager,
    jobDxid: string,
    scope: EntityScope,
  ): Promise<void> {
    // release files if they are locked by this job
    // e.g locked by jupyterlab
    const lockedKey = `notebook-locked-by-${jobDxid}`
    const fileRepo = em.getRepository(UserFile)
    await em.transactional(async (tem) => {
      const files = await fileRepo.find(
        { scope, taggings: { tag: { name: lockedKey } } },
        { populate: ['taggings.tag'] },
      )

      files.forEach((file) => {
        const tagging = <Tagging>file.taggings.getItems().find((t) => t.tag.name === lockedKey)
        file.taggings.remove(tagging)
      })

      tem.persist(files)
    })
  }

  private async sendNotification(
    job: Job,
    message: string,
    severity: SEVERITY,
    action: NOTIFICATION_ACTION,
  ): Promise<void> {
    const meta = {
      linkTitle: 'View Execution',
      linkUrl: `/home/executions/${job.uid}`,
    }

    const userId = this.userCtx.id
    const sessionId = this.userCtx.sessionId

    await this.notificationService.createNotification({
      message,
      severity,
      action,
      userId,
      sessionId,
      meta,
    })
  }

  /**
   * Checks job status if notifications should be triggered.
   */
  private async checkJobStatusForNotifications(
    job: Job,
    remoteJob: JobDescribeResponse,
  ): Promise<void> {
    const remoteState = remoteJob.state
    const isJobRunning = job.state !== JOB_STATE.RUNNING && remoteState === JOB_STATE.RUNNING
    const httpsAppRunning =
      remoteState === JOB_STATE.RUNNING &&
      remoteJob?.properties?.httpsAppState === JOB_STATE.RUNNING

    if (isJobRunning && job.hasHttpsAppState() && !httpsAppRunning) {
      await this.sendNotification(
        job,
        `Initializing ${job.name}`,
        SEVERITY.INFO,
        NOTIFICATION_ACTION.JOB_INITIALIZING,
      )
    }

    if ((isJobRunning && !job.hasHttpsAppState()) || httpsAppRunning) {
      await this.sendNotification(
        job,
        `${job.name} is running`,
        SEVERITY.INFO,
        NOTIFICATION_ACTION.JOB_RUNNING,
      )
    }

    if (job.state !== JOB_STATE.RUNNABLE && remoteState === JOB_STATE.RUNNABLE) {
      await this.sendNotification(
        job,
        `Job ${job.name} is runnable`,
        SEVERITY.INFO,
        NOTIFICATION_ACTION.JOB_RUNNABLE,
      )
    }

    if (job.state !== JOB_STATE.DONE && remoteState === JOB_STATE.DONE) {
      await this.sendNotification(
        job,
        `Job ${job.name} has finished`,
        SEVERITY.INFO,
        NOTIFICATION_ACTION.JOB_DONE,
      )
    }

    if (job.state !== JOB_STATE.TERMINATED && remoteState === JOB_STATE.TERMINATED) {
      await this.sendNotification(
        job,
        `Job ${job.name} has terminated`,
        SEVERITY.INFO,
        NOTIFICATION_ACTION.JOB_TERMINATED,
      )
    }

    if (remoteState === JOB_STATE.FAILED) {
      await this.sendNotification(
        job,
        `Job ${job.name} has failed`,
        SEVERITY.ERROR,
        NOTIFICATION_ACTION.JOB_FAILED,
      )
    }
  }
}
