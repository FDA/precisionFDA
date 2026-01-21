import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import {
  EmailTypeToContextMap,
  JobFinishedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { JobRepository } from '@shared/domain/job/job.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { jobFinishedTemplate } from '../mjml/job-finished.template'

@Injectable()
export class JobFinishedEmailHandler extends EmailHandler<EMAIL_TYPES.jobFinished> {
  protected emailType = EMAIL_TYPES.jobFinished as const
  protected inputDto = JobEventDTO
  protected getBody = jobFinishedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly userRepo: UserRepository,
    protected readonly jobRepo: JobRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: JobEventDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.jobFinished]> {
    const job = await this.jobRepo.findOneOrFail({ id: input.jobId })
    return {
      input,
      job,
    }
  }

  protected async getNotificationSettingKeys(context: JobFinishedContext): Promise<string[]> {
    return context.job.isPrivate() ? ['private_job_finished'] : []
  }

  protected async determineReceivers(context: JobFinishedContext): Promise<User[]> {
    if (context.job.isPublic()) {
      this.logger.log({ jobId: context.job.id }, 'Job is public, no one is notified')
      return []
    }
    // TODO PFDA-6311: other users if job runs in a space?
    if (context.job.isInSpace()) {
      this.logger.log({ jobId: context.job.id }, 'Job is in a space, todo')
      return []
    }
    // JOB IS PRIVATE
    const owner = await this.userRepo.findOneOrFail(
      { id: context.job.user.id },
      { populate: ['notificationPreference'] },
    )

    return [owner]
  }

  protected getSubject(context: JobFinishedContext): string {
    return `Execution ${context.job.name} finished`
  }

  protected getTemplateInput(
    context: JobFinishedContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.jobFinished] {
    return {
      firstName: receiver?.firstName,
      content: { job: { id: context.job.id, uid: context.job.uid, name: context.job.name } },
    }
  }
}
