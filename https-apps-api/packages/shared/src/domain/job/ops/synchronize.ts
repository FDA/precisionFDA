import { wrap } from '@mikro-orm/core'
import { CheckStatusJob, TASK_TYPE } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import { JOB_DB_ENTITY_TYPE } from '../job.enum'
import {
  buildIsOverMaxDuration,
  isStateActive,
  isStateTerminal,
  shouldSyncStatus,
} from '../job.helper'
import { PlatformClient, JobDescribeResponse } from '../../../platform-client'
import {
  createSendEmailTask,
  createSyncWorkstationFilesTask,
  removeFromEmailQueue,
  removeRepeatable
} from '../../../queue'
import type { Maybe, UserOpsCtx } from '../../../types'
import { User } from '../..'
import { errors } from '../../..'
import { createJobClosed } from '../../event/event.helper'
import { RequestTerminateJobOperation } from '..'
import {
  JobStaleInputTemplate,
  jobStaleTemplate,
} from '../../email/templates/mjml/job-stale.handler'
import { buildEmailTemplate } from '../../email/email.helper'
import { EmailSendInput, EMAIL_TYPES } from '../../email/email.config'
import { JOB_STATE } from '../job.enum'
import { EmailSendOperation } from '../../email'
import { JobFailedEmailHandler } from '../../email/templates/handlers'

// N.B. SyncJobOperation is only meant for syncing HTTPS/Workstation apps
//      In the future we'd need to rename this to something more specific
//      when normal job syncing is also a part of the nodejs-worker
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
    const job = await jobRepo.findOne({ dxid: input.dxid })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    // check input data
    if (!job) {
      this.ctx.log.error({ input }, 'SyncJobOperation: Error: Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    // This operation currently only handles HTTPS apps correctly, but when we migrate
    // job syncing to nodejs we'll relax this condition
    //
    if (!job.isHTTPS()) {
      this.ctx.log.error({ input }, 'SyncJobOperation: Error: Job is not HTTPS app')
      await removeRepeatable(this.ctx.job)
      return
    }

    if (!user) {
      this.ctx.log.error({ input }, 'SyncJobOperation: Error: User does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }

    // todo: check users ownership -> we should have a helper for it
    this.job = job
    this.user = user
    this.client = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    this.ctx.log.info({ jobId: job.id }, 'SyncJobOperation: Processing job')

    if (!shouldSyncStatus(job)) {
      this.ctx.log.info({ input, job }, 'SyncJobOperation: Job is already finished. Removing task')
      await removeRepeatable(this.ctx.job)
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
      if (err instanceof errors.ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.ctx.log.info({ error: err.props },
            'SyncJobOperation: Received 401 from platform, removing sync task')
          await removeRepeatable(this.ctx.job)
        }
      }
      else {
        this.ctx.log.info({ error: err },
          'SyncJobOperation: Unhandled error from job/describe, will retry later')
      }
      return
    }

    // TODO(samuel) this shoudl be part of platform client
    delete platformJobData["sshHostKey"]
    this.ctx.log.info({ platformJobData: platformJobData }, 'SyncJobOperation: Received job/describe from platform')

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
      this.ctx.log.info({ jobId: job.id }, 'SyncJobOperation: Job marked as stale, trying to terminate')
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
    if (remoteState === job.state) {
      this.ctx.log.info({ remoteState }, 'SyncJobOperation: State has not changed, no updates')
      return
    }

    if (isStateTerminal(remoteState)) {
      this.ctx.log.debug({ remoteState }, 'SyncJobOperation: Remote job state is terminal, will sync folders and files')
      // create jobClosed event
      const eventEntity = await createJobClosed(user, job)
      em.persist(eventEntity)

      if (remoteState === JOB_STATE.FAILED) {
        if (job.state === JOB_STATE.RUNNING) {
        // if latest known state was 'running' then platform terminated the job
          this.ctx.log.info({
            jobId: input.dxid,
            failureReason: platformJobData.failureReason,
            failureMessage: platformJobData.failureMessage,
          }, 'SyncJobOperation: Detected job termination by platform')
        } else {
          this.ctx.log.info({
            failureCounts: platformJobData.failureCounts,
            failureReason: platformJobData.failureReason,
            failureMessage: platformJobData.failureMessage,
          }, 'SyncJobOperation: Detected failed job')
          await this.sendJobFailedEmails()
        }
      }

      // Use the following to invoke sync files within this operation to debug
      // const syncJobFilesOp = new WorkstationSyncFilesOperation(this.ctx)
      // await syncJobFilesOp.execute({ dxid: job.dxid })

      // Queue file sync task, so that the syncing is not blocked
      createSyncWorkstationFilesTask({ dxid: job.dxid }, this.ctx.user)
    }

    this.ctx.log.info({
      jobId: input.dxid,
      fromState: job.state,
      toState: remoteState,
    }, 'SyncJobOperation: Updating job state and metadata from platform')
    const updatedJob = wrap(job).assign(
      {
        describe: JSON.stringify(platformJobData),
        state: platformJobData.state,
      },
      { em },
    )
    await em.flush()

    // Note(samuel) email has to be sent after em. flush, otherwise failureReason won't be propagated in database
    // Alternative - pass failure reason and other 
    if (remoteState === JOB_STATE.FAILED) {
      this.ctx.log.info({
        failureCounts: platformJobData.failureCounts,
        failureReason: platformJobData.failureReason,
        failureMessage: platformJobData.failureMessage,
      }, 'SyncJobOperation: Detected failed job')

      try {
        await this.sendJobFailedEmails()
      } catch (e) {
        this.ctx.log.error({ job: updatedJob }, 'SyncJobOperation: Failed to send emails')
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
      subject: `precisionFDA Workstation ${this.job.name} will terminate in 24 hours`,
      body,
    }
    const jobId = EmailSendOperation.getBullJobId(EMAIL_TYPES.jobTerminationWarning, this.job.dxid)
    this.ctx.log.info({
      jobId: this.job.id,
      jobDxid: this.job.dxid,
      user: this.user.dxuser,
      recipient: this.user.email,
      bullJobId: jobId,
    }, 'SyncJobOperation: Sending termination warning email to user')
    await createSendEmailTask(email, this.ctx.user, jobId)
  }

  private async sendJobFailedEmails(): Promise<void> {
    const handler = new JobFailedEmailHandler(
      EMAIL_TYPES.jobFailed,
      { jobId: this.job.id },
      this.ctx,
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
      this.ctx.log.info({
        jobId: this.job.id,
        jobDxid: this.job.dxid,
        user: this.user.dxuser,
        recipient: email.to,
      }, 'SyncJobOperation: Sending failed job email to user')

      await createSendEmailTask(email, this.ctx.user)
    })) as any
  }

  private removeTerminationEmailJob() {
    const jobId = EmailSendOperation.getBullJobId(EMAIL_TYPES.jobTerminationWarning, this.job.dxid)
    removeFromEmailQueue(jobId)
  }
}
