import { Injectable } from '@nestjs/common'
import {
  EmailTypeToContextMap,
  ExpertAddedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { getUserTitle } from '@shared/domain/email/templates/mjml/common'
import { expertAddedTemplate } from '@shared/domain/email/templates/mjml/expert-added.template'
import { ExpertRepository } from '@shared/domain/expert/repository/expert.repository'
import { User } from '@shared/domain/user/user.entity'
import { EmailClient } from '@shared/services/email-client'

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

  protected getSubject(context: ExpertAddedContext): string {
    const name = getUserTitle(context.expert.user.getEntity())
    return `A new Expert Q&A Session was created for ${name}`
  }

  protected getTemplateInput(
    context: ExpertAddedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.expertAdded] {
    const name = getUserTitle(context.expert.user.getEntity())
    return {
      content: {
        expertName: name,
        expertId: context.expert.id,
      },
    }
  }
}
