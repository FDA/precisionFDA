import { WorkerBaseOperation } from '../../../utils/base-operation'
import { CheckStaleJobsJob } from '../../../queue/task.input'
import { Job } from '../job.entity'
import { Maybe } from '../../../types'
import { JOB_STATE } from '../job.enum'
import { config } from '../../../config'
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


// This operation is run by admin to alert her/him that there are stale jobs that need
// to be looked into
export class CheckStaleJobsOperation extends WorkerBaseOperation<
  CheckStaleJobsJob['payload'],
  Maybe<Job[]>
> {
  protected client: PlatformClient

  async run(): Promise<Maybe<Job[]>> {
    // find running jobs that are close to "deadline" -> 30days in production
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const runningJobs = await jobRepo.find({
      $or: [
        { state: JOB_STATE.IDLE },
        { state: JOB_STATE.RUNNING },
        { state: JOB_STATE.TERMINATING },
      ]
    },
    {
      populate: ['app', 'user']
    })

    const isOverMaxDuration = buildIsOverMaxDuration('terminate')
    const staleJobs: Job[] = runningJobs.filter(job => isOverMaxDuration(job))
    if (staleJobs.length === 0) {
      this.ctx.log.info({}, 'No stale jobs found')
      return []
    }

    const staleJobsInfos = staleJobs.map(job => ({
      uid: job.uid,
      name: job.name,
      dxuser: job.user.getEntity().dxuser,
      duration: job.elapsedTimeSinceCreationString(),
    }))

    this.ctx.log.info(
      { staleJobs: staleJobsInfos },
      'CheckStaleJobsOperation: Stale jobs - should be terminated',
    )

    // generate email for admin with list of jobs
    const adminUser = await em.getRepository(User).findAdminUser()
    const emailTemplate = reportStaleJobsTemplate
    const body = buildEmailTemplate<ReportStaleJobsTemplateInput>(emailTemplate, {
      receiver: adminUser,
      content: {
        jobInfos: staleJobsInfos,
        maxDuration: config.workerJobs.syncJob.staleJobsTerminateAfter.toString() ?? 'Undefined',
      },
    })
    const email: EmailSendInput = {
      to: adminUser.email,
      body,
      subject: 'Stale jobs report',
    }
    await createSendEmailTask(email, this.ctx.user)
    return staleJobs
  }
}
