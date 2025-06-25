import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import {
  jobFailedTemplate,
  jobCostLimitExceededTemplate,
  JobFailedInputTemplate,
} from '../mjml/job-failed.template'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { JobRepository } from '@shared/domain/job/job.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import {
  EmailTypeToContextMap,
  JobFailedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'

@Injectable()
export class JobFailedEmailHandler extends EmailHandler<EMAIL_TYPES.jobFailed> {
  protected emailType = EMAIL_TYPES.jobFailed as const
  protected inputDto = JobEventDTO

  constructor(
    protected readonly userRepo: UserRepository,
    protected readonly jobRepo: JobRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: JobEventDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.jobFailed]> {
    const job = await this.jobRepo.findOneOrFail({ id: input.jobId })
    const body =
      job.describe?.failureReason === 'CostLimitExceeded'
        ? jobCostLimitExceededTemplate
        : jobFailedTemplate
    return {
      input,
      job,
      body,
    }
  }

  // Stolen this function from JobFinishedEmailHandler handler
  protected async determineReceivers(context: JobFailedContext): Promise<User[]> {
    // Notify only owner in all cases - regardless whether job is private, or runs in space
    const owner = await this.userRepo.findOneOrFail(
      { id: context.job.user.id },
      { populate: ['notificationPreference'] },
    )
    // Note(samuel) if different recipients are required for "CostLimitExceeded" and other failures
    // please refactor into separate handler

    return [owner]
  }

  protected getSubject(_receiver: User, context: JobFailedContext): string {
    return `Execution "${context.job.name}" failed`
  }

  protected getBody(_input: JobFailedInputTemplate, contextObject: JobFailedContext): string {
    return contextObject.body(_input)
  }

  protected getTemplateInput(
    receiver: User,
    context: JobFailedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.jobFailed] {
    return {
      receiver,
      content: {
        job: {
          id: context.job.id,
          uid: context.job.uid,
          name: context.job.name,
          failureReason: context.job.describe?.failureReason ?? '',
          failureMessage: context.job.describe?.failureMessage ?? '',
          runTimeString: context.job.runTimeString(),
        },
      },
    }
  }
}
