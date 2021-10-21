import { WorkerBaseOperation } from '../../../utils/base-operation'
import { CheckStaleJobsJob } from '../../../queue/task.input'
import { Job } from '../job.entity'
import { Maybe } from '../../../types'
import { JOB_STATE } from '../job.enum'
import { User } from '../..'
import { buildEmailTemplate } from '../../email/email.helper'
import {
  reportStaleJobsTemplate,
  ReportStaleJobsTemplateInput,
} from '../../email/templates/mjml/report-stale-jobs.template'
import { EmailSendInput } from '../../email/email.config'
import { createSendEmailTask } from '../../../queue'
import { buildIsOverMaxDuration } from '../job.helper'

export class CheckStaleJobsOperation extends WorkerBaseOperation<
  CheckStaleJobsJob['payload'],
  Maybe<Job[]>
> {
  async run(): Promise<Maybe<Job[]>> {
    // find running jobs that are close to "deadline" -> 30days in production
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const runningJobs = await jobRepo.find({
      $or: [{ state: JOB_STATE.IDLE }, { state: JOB_STATE.RUNNING }],
    })
    const isOverMaxDuration = buildIsOverMaxDuration('terminate')
    const staleJobs = runningJobs.filter(job => isOverMaxDuration(job))
    this.ctx.log.info(
      { staleJobIds: staleJobs.map(job => job.id) },
      'Stale jobs - should be terminated',
    )
    // generate email for admin with list of jobs
    const adminUser = await em.getRepository(User).findAdminUser()
    const emailTemplate = reportStaleJobsTemplate
    const body = buildEmailTemplate<ReportStaleJobsTemplateInput>(emailTemplate, {
      receiver: adminUser,
      content: {
        jobIds: staleJobs.map(job => job.id),
        maxDuration: 'add-max-duration',
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
