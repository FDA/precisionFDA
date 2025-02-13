import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { buildEmailTemplate, ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { Expert } from '@shared/domain/expert/expert.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  expertAddedTemplate,
  ExpertAddedTemplateInput,
} from '@shared/domain/email/templates/mjml/expert-added.template'
import { getUserTitle } from '@shared/domain/email/templates/mjml/common'

export class ExpertAddedHandler
  extends BaseTemplate<ObjectIdInputDTO, UserOpsCtx>
  implements EmailTemplate<ExpertAddedTemplateInput>
{
  expertId = this.validatedInput.id
  expert: Expert
  templateFile = expertAddedTemplate

  async setupContext(): Promise<void> {
    this.expert = await this.ctx.em.findOneOrFail(
      Expert,
      {
        id: this.expertId,
      },
      { populate: ['user'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    return [this.expert.user.getEntity()]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const name = getUserTitle(this.expert.user.getEntity())
    const body = buildEmailTemplate(this.templateFile, {
      content: {
        expertName: name,
        expertId: this.expert.id,
      },
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.expertAdded,
      to: receiver.email,
      body: body,
      subject: `A new Expert Q&A Session was created for ${name}`,
    }
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'expert_added'
  }
}
