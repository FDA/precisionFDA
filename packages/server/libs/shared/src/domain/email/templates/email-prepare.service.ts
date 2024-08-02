import { Injectable, Logger } from '@nestjs/common'
import { EmailProcessInput, EmailTemplate, getEmailConfig } from '@shared/domain/email/email.config'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DNANEXUS_INVALID_EMAIL } from '@shared/config/consts'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SqlEntityManager } from '@mikro-orm/mysql'

/**
 * EmailPrepareService is a service class responsible for preparing and sending emails
 * based on given input parameters. It uses an email template to determine the recipients
 * and sends the emails to active receivers.
 */
@Injectable()
export class EmailPrepareService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
  ) {}

  async prepareEmails(input: EmailProcessInput) {
    const emailTemplate = await this.getEmailTemplate(input)
    const receivers = await emailTemplate.determineReceivers()
    const activeReceivers = receivers.filter(
      (user) => !user.email?.includes(DNANEXUS_INVALID_EMAIL),
    )
    return await Promise.all(
      activeReceivers.map(async (receiver) => emailTemplate.template(receiver)),
    )
  }

  private async getEmailTemplate(emailProcessInput: EmailProcessInput): Promise<EmailTemplate> {
    const emailConfig = getEmailConfig(emailProcessInput.emailTypeId)
    const handler = emailConfig.handlerClass
    // this also runs input validation
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }
    const instance = new handler(emailProcessInput.emailTypeId, emailProcessInput.input, opsCtx)
    await instance.setupContext()
    return instance
  }
}
