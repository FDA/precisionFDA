import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserOpsCtx } from '../../../../types'
import { EmailSendInput, EmailTemplate, EMAIL_TYPES, NOTIFICATION_TYPES_BASE } from '../../email.config'
import {
  JobFailedInputTemplate,
  jobFailedTemplate,
  jobCostLimitExceededTemplate,
} from '../mjml/job-failed.template'
import { buildEmailTemplate } from '../../email.helper'

type JobFailedInputType = { jobId: number }

export class JobFailedEmailHandler
  extends BaseTemplate<JobFailedInputType, UserOpsCtx>
  implements Omit<EmailTemplate, 'templateFile'> {
  job: Job


  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'job_failed'
  }


  async setupContext(): Promise<void> {
    this.job = await this.ctx.em.findOneOrFail(Job, { id: this.validatedInput.jobId })
  }

  // Stolen this function from JobFinishedEmailHandler handler
  async determineReceivers(): Promise<User[]> {
    // Notify only owner in all cases - regardless whether job is private, or runs in space
    const owner = await this.ctx.em.findOneOrFail(
      User,
      { id: this.job.user.id },
      { populate: ['notificationPreference'] },
    )
    // Note(samuel) if different recipients are required for "CostLimitExceeded" and other failures
    // please refactor into separate handler

    return [owner]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<JobFailedInputTemplate>(
      this.job.describe?.failureReason === 'CostLimitExceeded' ? jobCostLimitExceededTemplate : jobFailedTemplate,
      {
        receiver,
        content: {
          job: {
            id: this.job.id,
            uid: this.job.uid,
            name: this.job.name,
            failureReason: this.job.describe?.failureReason ?? '',
            failureMessage: this.job.describe?.failureMessage ?? '',
            runTimeString: this.job.runTimeString(),
          },
        },
      },
    )

    return {
      emailType: EMAIL_TYPES.jobFailed,
      to: receiver.email,
      subject: `Execution "${this.job.name}" failed`,
      body,
    }
  }
}

