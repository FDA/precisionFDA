import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { StaleJobsReportContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { AdminStaleJobsReportDTO } from '@shared/domain/job/dto/admin-stale-job-report-input.dto'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { reportStaleJobsTemplate } from '../mjml/report-stale-jobs.template'

@Injectable()
export class StaleJobsReportHandler extends EmailHandler<EMAIL_TYPES.staleJobsReport> {
  protected emailType = EMAIL_TYPES.staleJobsReport as const
  protected inputDto = AdminStaleJobsReportDTO
  protected getBody = reportStaleJobsTemplate

  constructor(
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async determineReceivers(): Promise<EmailAddress[]> {
    return [config.emails.report]
  }

  protected getSubject(): string {
    return 'Stale jobs report'
  }

  protected getTemplateInput(
    context: StaleJobsReportContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.staleJobsReport] {
    return {
      content: context.input,
    }
  }

  protected async getContextualData(input: AdminStaleJobsReportDTO): Promise<StaleJobsReportContext> {
    return { input: input }
  }
}
