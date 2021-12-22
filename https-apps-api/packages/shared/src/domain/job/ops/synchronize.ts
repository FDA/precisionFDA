import { wrap } from '@mikro-orm/core'
import { CheckStatusJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
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
  removeRepeatable,
  TASKS} from '../../../queue'
import type { Maybe } from '../../../types'
import { User } from '../..'
import { errors } from '../../..'
import { createJobClosed } from '../../event/event.helper'
import { RequestTerminateJobOperation } from '..'
import {
  JobStaleInputTemplate,
  jobStaleTemplate,
} from '../../email/templates/mjml/job-stale.handler'
import { buildEmailTemplate } from '../../email/email.helper'
import { EmailSendInput } from '../../email/email.config'
import { JOB_STATE } from '../job.enum'

// N.B. SyncJobOperation is only meant for syncing HTTPS/Workstation apps
//      In the future we'd need to rename this to something more specific
//      when normal job syncing is also a part of the nodejs-worker
export class SyncJobOperation extends WorkerBaseOperation<CheckStatusJob['payload'], Maybe<Job>> {
  protected user: User
  protected job: Job
  protected client: PlatformClient

  static getBullJobId(jobDxid: string) {
    return `${TASKS.SYNC_JOB_STATUS}.${jobDxid}`
  }

  async run(input: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    // check input data
    if (!job) {
      this.ctx.log.error({ input }, 'Error: Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }
    if (!user) {
      this.ctx.log.error({ input }, 'Error: User does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }
    // todo: check users ownership -> we should have a helper for it
    this.job = job
    this.user = user
    this.client = new PlatformClient(this.ctx.log)
    this.ctx.log.info({ jobId: job.id }, 'SyncJobOperation: Processing job')

    if (!shouldSyncStatus(job)) {
      this.ctx.log.info({ input, job }, 'SyncJobOperation: Job is already finished. Removing task')
      await removeRepeatable(this.ctx.job)
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.client.jobDescribe({
        jobId: input.dxid,
        accessToken: this.ctx.user.accessToken,
      })
    } catch (err) {
      if (err instanceof errors.ClientRequestError) {
        // we retrieved response status code
        if (err.props?.clientStatusCode && err.props?.clientStatusCode >= 500) {
          // there was an error on platform side, we will retry later
          this.ctx.log.info({ error: err.props },
            'SyncJobOperation: Will not remove this job - 5xx error code detected')
          return
        }
      }

      this.ctx.log.info({ error: err.props },
        'SyncJobOperation: Error on job/describe Removing sync job task')
      // handle WORKER dirty state here
      // we could do more efficient error handling and also calls repetition here
      await removeRepeatable(this.ctx.job)
      return
    }

    delete platformJobData["sshHostKey"]
    this.ctx.log.info({ platformJobData: platformJobData }, 'SyncJobOperation: Received job/describe from platform')

    const isOverNotifyMaxDuration = buildIsOverMaxDuration('notify')
    const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
    if (
      isStateActive(job.state) &&
      isOverNotifyMaxDuration(job) &&
      !isOverTerminateMaxDuration(job)
    ) {
      await this.sendTerminationEmail()
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

      if (remoteState == JOB_STATE.FAILED) {
        this.ctx.log.info({
          failureCounts: platformJobData.failureCounts,
          failureReason: platformJobData.failureReason,
          failureMessage: platformJobData.failureMessage,
        }, 'SyncJobOperation: Detected failed job')
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
    this.ctx.log.debug({ job: updatedJob }, 'SyncJobOperation: Updated job')
  }

  private async sendTerminationEmail(): Promise<void> {
    // send email to job owner
    const body = buildEmailTemplate<JobStaleInputTemplate>(jobStaleTemplate, {
      receiver: this.user,
      content: { job: { id: this.job.id, name: this.job.name, uid: this.job.uid } },
    })
    const email: EmailSendInput = {
      to: this.user.email,
      subject: `precisionFDA Workstation ${this.job.name} will terminate in 24 hours`,
      body,
    }
    await createSendEmailTask(email, this.ctx.user)
  }
}
