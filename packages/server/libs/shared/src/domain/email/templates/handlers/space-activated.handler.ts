import { buildEmailTemplate, ObjectIdInputDto } from '@shared/domain/email/email.helper'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import {
  spaceActivatedTemplate,
  SpaceActivatedTemplateInput,
} from '@shared/domain/email/templates/mjml/space-activated.template'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'

export class SpaceActivatedHandler
  extends BaseTemplate<ObjectIdInputDto, UserOpsCtx>
  implements EmailTemplate<SpaceActivatedTemplateInput>
{
  templateFile = spaceActivatedTemplate
  spaceMembership: SpaceMembership

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_activated'
  }

  async setupContext(): Promise<void> {
    this.spaceMembership = await this.ctx.em.findOneOrFail(
      SpaceMembership,
      {
        id: this.validatedInput.id,
      },
      { populate: ['user', 'spaces'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    return [this.spaceMembership.user.getEntity()]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const space = this.spaceMembership.spaces[0]
    const body = buildEmailTemplate<SpaceActivatedTemplateInput>(this.templateFile, {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      spaceTitle: space.name,
      spaceUrl: `${config.api.railsHost}/spaces/${space.id}`,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.spaceActivated,
      to: receiver.email,
      body,
      subject: 'Space Activated',
    }
  }
}
