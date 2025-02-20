import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { UserOpsCtx } from '@shared/types'
import { buildEmailTemplate, ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import {
  spaceActivationTemplate,
  SpaceActivationTemplateInput,
} from '@shared/domain/email/templates/mjml/space-activation.template'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { config } from '@shared/config'

export class SpaceActivationHandler
  extends BaseTemplate<ObjectIdInputDTO, UserOpsCtx>
  implements EmailTemplate<SpaceActivationTemplateInput>
{
  templateFile = spaceActivationTemplate
  spaceMembership: SpaceMembership

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_activation'
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

  template(receiver: User): Promise<EmailSendInput> {
    const space = this.spaceMembership.spaces[0]
    let activationRequestLead: string
    let leadsNames: string
    if (space.type === SPACE_TYPE.ADMINISTRATOR) {
      activationRequestLead =
        this.spaceMembership.side === SPACE_MEMBERSHIP_SIDE.HOST ? 'creator' : 'approver'
      leadsNames = 'creator and approver'
    } else {
      activationRequestLead = this.spaceMembership.getSpaceMembershipSideAlias()
      leadsNames = 'host and guest'
    }

    const body = buildEmailTemplate<SpaceActivationTemplateInput>(this.templateFile, {
      spaceTitle: space.name,
      activationRequestLead,
      spaceUrl: `${config.api.railsHost}/spaces/${this.spaceMembership.spaces[0].id}`,
      isReviewSpace: space.type === SPACE_TYPE.REVIEW,
      leadsNames,
      receiver,
    })
    return Promise.resolve({
      emailType: EMAIL_TYPES.spaceActivation,
      to: receiver.email,
      body,
      subject: `Action required to activate new space ${this.spaceMembership.spaces[0].name}`,
    })
  }
}
