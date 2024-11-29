import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  expertQuestionAddedTemplate,
  ExpertQuestionTemplateInput,
} from '@shared/domain/email/templates/mjml/expert-question-added.template'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { getUserTitle } from '@shared/domain/email/templates/mjml/common'

export type ExpertQuestionAddedInputType = { id: number }

export class ExpertQuestionAddedHandler
  extends BaseTemplate<ExpertQuestionAddedInputType, UserOpsCtx>
  implements EmailTemplate<ExpertQuestionTemplateInput>
{
  expertQuestionId = this.validatedInput.id
  expertQuestion: ExpertQuestion
  templateFile = expertQuestionAddedTemplate

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'expert_question_added'
  }
  async setupContext(): Promise<void> {
    this.expertQuestion = await this.ctx.em.findOneOrFail(
      ExpertQuestion,
      {
        id: this.expertQuestionId,
      },
      { populate: ['expert.user'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    return [this.expertQuestion.expert.user.getEntity()]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const name = getUserTitle(receiver)
    const body = buildEmailTemplate(this.templateFile, {
      content: {
        senderName: name,
        questionBody: this.expertQuestion.body,
        expertId: this.expertQuestion.expert.id,
        questionId: this.expertQuestion.id,
      },
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.expertQuestionAdded,
      to: receiver.email,
      body: body,
      subject: `A new question was submitted by ${name}`,
    }
  }
}
