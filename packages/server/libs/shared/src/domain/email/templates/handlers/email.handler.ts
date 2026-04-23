import { Logger, Type } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { ValidationArguments } from 'class-validator'
import mjml2html from 'mjml'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToInputMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { IsEmailInputValidConstraint } from '@shared/domain/email/dto/is-email-input-valid.constraint'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EmailClient } from '@shared/services/email-client'
import { ArrayUtils } from '@shared/utils/array.utils'

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
      throw new ValidationError(constraint.defaultMessage({ object: validationObject } as ValidationArguments))
    }
  }

  protected abstract getContextualData(input: EmailTypeToInputMap[T]): Promise<EmailTypeToContextMap[T]>

  protected abstract getSubject(contextObject: EmailTypeToContextMap[T], receiver?: User): string

  protected abstract getBody(input: EmailTypeToTemplateInputMap[T], contextObject: EmailTypeToContextMap[T]): string

  protected abstract getTemplateInput(
    contextObject: EmailTypeToContextMap[T],
    receiver?: User,
  ): EmailTypeToTemplateInputMap[T]

  protected abstract determineReceivers(_contextObject: EmailTypeToContextMap[T]): Promise<(User | EmailAddress)[]>

  protected getBcc(_contextObject: EmailTypeToContextMap[T], _receiver: User): string {
    return null
  }

  protected getReplyTo(_contextObject: EmailTypeToContextMap[T], _receiver: User): string {
    return null
  }

  protected async getNotificationSettingKeys(_contextObject: EmailTypeToContextMap[T], _user: User): Promise<string[]> {
    return []
  }

  private get emailTypeName(): string {
    return EMAIL_TYPES[this.emailType] ?? String(this.emailType)
  }

  async sendEmail(inputDto: EmailTypeToInputMap[T]): Promise<void> {
    this.logger.log(`Preparing email of type '${this.emailTypeName}'`)
    const contextObject = await this.getContextualData(inputDto)
    await this.validateInput(inputDto)
    const receivers = await this.determineReceivers(contextObject)

    const { users, emailAddresses } = this.splitReceivers(receivers)
    const filteredUsers = await this.filterReceiversByPreference(users, contextObject)

    const emailInputs: EmailSendInput[] = []

    for (const receiver of filteredUsers) {
      const emailSendInput = await this.createEmailSendInput(contextObject, receiver.email, receiver)

      emailInputs.push(emailSendInput)
    }

    for (const address of emailAddresses) {
      const emailSendInput = await this.createEmailSendInput(contextObject, address)
      emailInputs.push(emailSendInput)
    }

    for (const input of emailInputs) {
      this.logger.log(`Sending email: type='${this.emailTypeName}', subject='${input.subject}'`)
      await this.emailClient.sendEmail(input)
    }
  }

  protected buildBody(contextObject: EmailTypeToContextMap[T], receiver?: User): string {
    const templateInput = this.getTemplateInput(contextObject, receiver)
    const template = this.getBody(templateInput, contextObject)
    const processed = mjml2html(template)
    return processed.html
  }

  private splitReceivers(receivers: (User | EmailAddress)[]): {
    users: User[]
    emailAddresses: EmailAddress[]
  } {
    const users: User[] = []
    const emailAddresses: EmailAddress[] = []

    receivers.forEach(r => {
      if (typeof r === 'string') {
        emailAddresses.push(r)
      } else {
        users.push(r)
      }
    })

    return { users, emailAddresses }
  }

  private async createEmailSendInput(
    contextObject: EmailTypeToContextMap[T],
    email: string,
    receiver?: User,
  ): Promise<EmailSendInput> {
    return {
      emailType: this.emailType,
      to: email,
      body: this.buildBody(contextObject, receiver),
      subject: this.getSubject(contextObject, receiver),
      bcc: this.getBcc(contextObject, receiver),
      replyTo: this.getReplyTo(contextObject, receiver),
    }
  }

  private async filterReceiversByPreference(
    receivers: User[],
    contextObject: EmailTypeToContextMap[T],
  ): Promise<User[]> {
    const result: User[] = []

    for (const receiver of receivers) {
      const notificationKeys = await this.getNotificationSettingKeys(contextObject, receiver)

      if (ArrayUtils.isEmpty(notificationKeys)) {
        result.push(receiver)
        continue
      }

      const preferences = receiver.notificationPreference?.getEntity().data
      if (preferences && notificationKeys.some(key => preferences[key])) {
        result.push(receiver)
      }
    }

    return result
  }
}
