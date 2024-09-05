import { Injectable, Logger } from '@nestjs/common'
import type { EmailSendInput } from '@shared/domain/email/email.config'
import { getServiceFactory } from '@shared/services/service-factory'
import { config } from '@shared/config'
import { ENVS } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

// TODO do we need this, or skip it in favour of emailService?
@Injectable()
export class EmailSendService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor() {}

  async sendEmail(input: EmailSendInput) {
    const emailService = getServiceFactory().getEmailService()
    try {
      if (config.env !== ENVS.PRODUCTION) {
        input.subject = `[${config.env}] ${input.subject}`
      }

      await emailService.sendEmail(input)
      return true
    } catch (err) {
      this.logger.error({ err }, 'AWS SES client failed')
      throw err
    }
  }
}
