import { WorkerBaseOperation } from '../../../utils/base-operation'
import { CheckStaleJobsJob } from '../../../queue/task.input'
import { Job } from '../job.entity'
import { Maybe, UserOpsCtx } from '../../../types'
import { config } from '../../../config'
import { queue } from '../../..'
import { User } from '../..'
import { buildEmailTemplate } from '../../email/email.helper'
import {
  reportStaleJobsTemplate,
  ReportStaleJobsTemplateInput,
} from '../../email/templates/mjml/report-stale-jobs.template'
import { EmailSendInput, EMAIL_TYPES } from '../../email/email.config'
import { createSendEmailTask } from '../../../queue'
import { buildIsOverMaxDuration } from '../job.helper'
import { PlatformClient } from '../../../platform-client'
import { difference } from 'ramda'
import { SyncJobOperation } from '../'


// This operation is run by admin to alert her/him that there are stale jobs that need
// to be looked into
export class CheckStaleJobsOperation extends WorkerBaseOperation<
  UserOpsCtx,
  CheckStaleJobsJob['payload'],
  Maybe<Job[]>
> {
  protected client: PlatformClient

  async run(): Promise<Maybe<Job[]>> {
    // find running jobs that are close to "deadline" -> 30days in production
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const runningJobs = await jobRepo.find({}, {
      filters: ['isNonTerminal'],
      orderBy: { createdAt: 'DESC' },
      populate: ['app', 'user'],
    })

    runningJobs.map(async (job) => {
      const runningJob = await queue.getMainQueue().getJob(SyncJobOperation.getBullJobId(job.dxid))
      if (!runningJob) {
        await queue.createSyncJobStatusTask(job, this.ctx.user)
        this.ctx.log.info({}, `CheckStaleJobsOperation: Recreated missing SyncJobOperation for ${job.dxid}`)
      }
    })
    if (runningJobs.length === 0) {
      this.ctx.log.info({}, 'CheckStaleJobsOperation: No running jobs found')
      return []
    }

    const isOverMaxDuration = buildIsOverMaxDuration('notify')
    const staleJobs: Job[] = runningJobs.filter(job => isOverMaxDuration(job))
    if (staleJobs.length === 0) {
      this.ctx.log.info({}, 'CheckStaleJobsOperation: No stale jobs found')
    }

    // TODO(samuel) use Set instead - reduce bundle size
    // TODO(samuel) refactor into repository method instead
    const nonStaleJobs = difference(runningJobs, staleJobs)

    const createJobInfo = (job: Job) => ({
      uid: job.uid,
      name: job.name,
      state: job.state,
      dxuser: job.user.getEntity().dxuser,
      duration: job.elapsedTimeSinceCreationString(),
    })
    const nonStaleJobsInfo = nonStaleJobs.map(createJobInfo)
    const staleJobsInfo = staleJobs.map(createJobInfo)

    this.ctx.log.info(
      { nonStaleJobsInfo: nonStaleJobsInfo },
      'CheckStaleJobsOperation: Non stale jobs - for admin to note the times',
    )
    this.ctx.log.info(
      { staleJobs: staleJobsInfo },
      'CheckStaleJobsOperation: Stale jobs - should be terminated',
    )

    // generate email for admin with list of jobs
    const adminUser = await em.getRepository(User).findAdminUser()
    const emailTemplate = reportStaleJobsTemplate
    const body = buildEmailTemplate<ReportStaleJobsTemplateInput>(emailTemplate, {
      receiver: adminUser,
      content: {
        staleJobsInfo: staleJobsInfo,
        nonStaleJobsInfo: nonStaleJobsInfo,
        maxDuration: config.workerJobs.syncJob.staleJobsEmailAfter.toString() ?? '-1',
      },
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.staleJobsReport,
      to: adminUser.email,
      body,
      subject: 'Stale jobs report',
    }
    const emailToPfda: EmailSendInput = {
      emailType: EMAIL_TYPES.staleJobsReport,
      to: 'precisionfda-no-reply@dnanexus.com',
      body,
      subject: 'Stale jobs report',
    }

    await createSendEmailTask(email, this.ctx.user)
    await createSendEmailTask(emailToPfda, this.ctx.user)

    return staleJobs
  }
}
