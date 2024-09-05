import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EmailProcessInput } from '@shared/domain/email/email.config'
import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { EmailSendService } from '@shared/domain/email/email-send.service'

@Injectable()
export class EmailFacade {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(
    private readonly emailPrepareService: EmailPrepareService,
    private readonly emailSendService: EmailSendService,
  ) {}

  async sendEmail(input: EmailProcessInput) {
    this.logger.log(
      `Sending email type: ${input.emailTypeId} to user ids: ${input.receiverUserIds}`,
    )
    const emails = await this.emailPrepareService.prepareEmails(input)
    await Promise.all(emails.map((email) => this.emailSendService.sendEmail(email)))
  }
}
