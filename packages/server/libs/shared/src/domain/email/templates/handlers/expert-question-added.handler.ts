import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { expertQuestionAddedTemplate } from '@shared/domain/email/templates/mjml/expert-question-added.template'
import { getUserTitle } from '@shared/domain/email/templates/mjml/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { Injectable } from '@nestjs/common'
import { ExpertQuestionRepository } from '@shared/domain/expert-question/expert-question.repository'
import {
  EmailTypeToContextMap,
  ExpertQuestionAddedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class ExpertQuestionAddedHandler extends EmailHandler<EMAIL_TYPES.expertQuestionAdded> {
  protected emailType = EMAIL_TYPES.expertQuestionAdded as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = expertQuestionAddedTemplate

  constructor(
    protected readonly expertQuestionRepo: ExpertQuestionRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.expertQuestionAdded]> {
    const expertQuestion = await this.expertQuestionRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['expert.user', 'user'] },
    )
    return { input, expertQuestion, questionAuthor: expertQuestion.user.getEntity() }
  }

  protected async determineReceivers(context: ExpertQuestionAddedContext): Promise<User[]> {
    const expertUser = await context.expertQuestion.expert.getEntity().user.getEntity()
    return [expertUser]
  }

  protected getSubject(_receiver: User, context: ExpertQuestionAddedContext): string {
    const name = getUserTitle(context.questionAuthor)
    return `A new question was submitted by ${name}`
  }

  protected getTemplateInput(
    receiver: User,
    context: ExpertQuestionAddedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.expertQuestionAdded] {
    const name = getUserTitle(context.questionAuthor)
    return {
      content: {
        senderName: name,
        questionBody: context.expertQuestion.body,
        expertId: context.expertQuestion.expert.id,
        questionId: context.expertQuestion.id,
      },
      receiver,
    }
  }
}
