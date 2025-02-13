import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { pipe, uniqBy } from 'ramda'
import {
  EmailSendInput,
  EmailTemplate,
  EMAIL_TYPES,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import { JobFinishedInputTemplate, jobFinishedTemplate } from '../mjml/job-finished.template'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'
import { UserOpsCtx } from '@shared/types'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'

export class JobFinishedEmailHandler
  extends BaseTemplate<JobEventDTO, UserOpsCtx>
  implements EmailTemplate<JobFinishedInputTemplate>
{
  templateFile = jobFinishedTemplate
  job: Job

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'job_finished'
  }

  async setupContext(): Promise<void> {
    this.job = await this.ctx.em.findOneOrFail(Job, { id: this.validatedInput.jobId })
  }

  async determineReceivers(): Promise<User[]> {
    if (this.job.isPublic()) {
      this.ctx.log.log({ jobId: this.job.id }, 'Job is public, noone is notified')
      return []
    }
    // todo: other users if job runs in a space?
    if (this.job.isInSpace()) {
      this.ctx.log.log({ jobId: this.job.id }, 'Job is in a space, todo')
      return []
    }
    // JOB IS PRIVATE
    const owner = await this.ctx.em.findOneOrFail(
      User,
      { id: this.job.user.id },
      { populate: ['notificationPreference'] },
    )

    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    const filterPipe = pipe(
      // User[] -> User[]
      filterFn,
      uniqBy((u: User) => u.id),
    )
    return filterPipe([owner])
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<JobFinishedInputTemplate>(this.templateFile, {
      receiver,
      content: { job: { id: this.job.id, uid: this.job.uid, name: this.job.name } },
    })
    return {
      emailType: EMAIL_TYPES.jobFinished,
      to: receiver.email,
      body,
      subject: `Execution ${this.job.name} finished`,
    }
  }
}
