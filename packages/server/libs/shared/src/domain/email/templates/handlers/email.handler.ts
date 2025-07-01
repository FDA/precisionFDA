import { Logger, Type } from '@nestjs/common'
import { EmailTypeToInputMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { IsEmailInputValidConstraint } from '@shared/domain/email/dto/is-email-input-valid.constraint'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EmailClient } from '@shared/services/email-client'
import { plainToInstance } from 'class-transformer'
import { ValidationArguments } from 'class-validator'
import mjml2html from 'mjml'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'

export abstract class EmailHandler<T extends EMAIL_TYPES> {
  @ServiceLogger()
  protected readonly logger: Logger

  protected abstract emailType: T
  protected abstract inputDto: Type<EmailTypeToInputMap[T]>

  protected constructor(protected readonly emailClient: EmailClient) {}

  private async validateInput(inputDto: EmailTypeToInputMap[T]): Promise<void> {
    const constraint = new IsEmailInputValidConstraint()
    const validationObject = { ...plainToInstance(Object, inputDto), type: this.emailType }
    const isValid = await constraint.validate(validationObject, {
      object: validationObject,
    } as ValidationArguments)
    if (!isValid) {
      throw new ValidationError(
        constraint.defaultMessage({ object: validationObject } as ValidationArguments),
      )
    }
  }

  protected abstract getContextualData(
    input: EmailTypeToInputMap[T],
  ): Promise<EmailTypeToContextMap[T]>

  protected abstract determineReceivers(contextObject: EmailTypeToContextMap[T]): Promise<User[]>

  protected abstract getSubject(receiver: User, contextObject: EmailTypeToContextMap[T]): string

  protected abstract getBody(
    input: EmailTypeToTemplateInputMap[T],
    contextObject: EmailTypeToContextMap[T],
  ): string

  protected abstract getTemplateInput(
    receiver: User,
    contextObject: EmailTypeToContextMap[T],
  ): EmailTypeToTemplateInputMap[T]

  protected getBcc(_receiver: User, _contextObject: EmailTypeToContextMap[T]): string {
    return null
  }

  protected getReplyTo(_receiver: User, _contextObject: EmailTypeToContextMap[T]): string {
    return null
  }

  async sendEmail(inputDto: EmailTypeToInputMap[T]): Promise<void> {
    this.logger.log(`sending email ${inputDto}`)
    const contextObject = await this.getContextualData(inputDto)
    await this.validateInput(inputDto)
    const receivers = await this.determineReceivers(contextObject)
    for (const receiver of receivers) {
      const emailSendInput = await this.createEmailSendInput(receiver, contextObject)
      await this.emailClient.sendEmail(emailSendInput)
    }
  }

  protected buildBody(receiver: User, contextObject: EmailTypeToContextMap[T]): string {
    const templateInput = this.getTemplateInput(receiver, contextObject)
    const template = this.getBody(templateInput, contextObject)
    const processed = mjml2html(template)
    return processed.html
  }

  private async createEmailSendInput(
    receiver: User,
    contextObject: EmailTypeToContextMap[T],
  ): Promise<EmailSendInput> {
    return {
      emailType: this.emailType,
      to: receiver.email,
      body: this.buildBody(receiver, contextObject),
      subject: this.getSubject(receiver, contextObject),
      bcc: this.getBcc(receiver, contextObject),
      replyTo: this.getReplyTo(receiver, contextObject),
    }
  }
}
