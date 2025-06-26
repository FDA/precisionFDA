import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { expertAddedTemplate } from '@shared/domain/email/templates/mjml/expert-added.template'
import { getUserTitle } from '@shared/domain/email/templates/mjml/common'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { ExpertRepository } from '@shared/domain/expert/expert.repository'
import {
  EmailTypeToContextMap,
  ExpertAddedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class ExpertAddedHandler extends EmailHandler<EMAIL_TYPES.expertAdded> {
  protected emailType = EMAIL_TYPES.expertAdded as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = expertAddedTemplate

  constructor(
    protected readonly expertRepo: ExpertRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.expertAdded]> {
    const expert = await this.expertRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['user'] },
    )
    return { expert, input }
  }

  protected async determineReceivers(context: ExpertAddedContext): Promise<User[]> {
    return [context.expert.user.getEntity()]
  }

  protected getSubject(_receiver: User, context: ExpertAddedContext): string {
    const name = getUserTitle(context.expert.user.getEntity())
    return `A new Expert Q&A Session was created for ${name}`
  }

  protected getTemplateInput(
    receiver: User,
    context: ExpertAddedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.expertAdded] {
    const name = getUserTitle(context.expert.user.getEntity())
    return {
      content: {
        expertName: name,
        expertId: context.expert.id,
      },
      receiver,
    }
  }
}
