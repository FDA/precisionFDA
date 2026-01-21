import { Injectable } from '@nestjs/common'
import { UserRunningJobsReportContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { UserRunningJobsReportDTO } from '@shared/domain/job/dto/user-running-job-report-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { reportRunningJobsTemplate } from '../mjml/report-user-running-jobs.template'

@Injectable()
export class UserRunningJobsReportHandler extends EmailHandler<EMAIL_TYPES.userRunningJobsReport> {
  protected emailType = EMAIL_TYPES.userRunningJobsReport as const
  protected inputDto = UserRunningJobsReportDTO
  protected getBody = reportRunningJobsTemplate

  constructor(
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async determineReceivers(context: UserRunningJobsReportContext): Promise<User[]> {
    const user = await this.userRepo.findOne(
      { id: context.input.jobOwner.id },
      {
        populate: ['notificationPreference'],
      },
    )
    return [user]
  }

  protected getSubject(): string {
    return 'User active jobs report'
  }

  protected getTemplateInput(
    context: UserRunningJobsReportContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.userRunningJobsReport] {
    return {
      content: {
        runningJobs: context.input.runningJobs,
        jobOwner: context.input.jobOwner,
      },
    }
  }

  protected async getContextualData(
    input: UserRunningJobsReportDTO,
  ): Promise<UserRunningJobsReportContext> {
    return { input: input }
  }

  protected async getNotificationSettingKeys(): Promise<string[]> {
    return ['private_job_stale']
  }
}
