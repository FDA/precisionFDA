import { Injectable, Logger } from '@nestjs/common'
import type { EmailSendInput } from '@shared/domain/email/email.config'
import { config } from '@shared/config'
import { ENVS } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EmailClient } from '@shared/services/email-client'

// TODO do we need this, or skip it in favour of emailService?
@Injectable()
export class EmailSendService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly emailClient: EmailClient) {}

  async sendEmail(input: EmailSendInput) {
    try {
      if (config.env !== ENVS.PRODUCTION) {
        input.subject = `[${config.env}] ${input.subject}`
      }

      await this.emailClient.sendEmail(input)
      return true
    } catch (err) {
      this.logger.error({ err }, 'AWS SES client failed')
      throw err
    }
  }
}
