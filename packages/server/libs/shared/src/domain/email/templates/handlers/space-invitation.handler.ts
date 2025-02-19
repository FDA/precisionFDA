import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { UserOpsCtx } from '@shared/types'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import {
  spaceInvitationTemplate,
  SpaceInvitationTemplateInput,
} from '@shared/domain/email/templates/mjml/space-invitation.template'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'
import { InvitationToSpaceDTO } from '@shared/domain/email/dto/invitation-to-space.dto'

export class SpaceInvitationHandler
  extends BaseTemplate<InvitationToSpaceDTO, UserOpsCtx>
  implements EmailTemplate<SpaceInvitationTemplateInput>
{
  templateFile = spaceInvitationTemplate
  membership: SpaceMembership
  admin: User // the user who added this membership

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_invitation'
  }

  async setupContext(): Promise<void> {
    this.membership = await this.ctx.em.findOneOrFail(
      SpaceMembership,
      {
        id: this.validatedInput.membershipId,
      },
      { populate: ['spaces', 'user'] },
    )
    this.admin = await this.ctx.em.findOneOrFail(User, { id: this.validatedInput.adminId })
  }

  async determineReceivers(): Promise<User[]> {
    return [this.membership.user.getEntity()]
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const space = this.membership.spaces[0]
    const body = buildEmailTemplate<SpaceInvitationTemplateInput>(this.templateFile, {
      spaceTitle: space.name,
      adminFullName: `${this.admin.fullName}`,
      membershipRoleAlias: this.membership.getSpaceMembershipRoleAlias(),
      membershipSideAlias: this.membership.getSpaceMembershipSideAlias(),
      spaceUrl: `${config.api.railsHost}/spaces/${space.id}`,
      adminUserUrl: `${config.api.railsHost}/users/${this.admin.dxuser}`,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.spaceInvitation,
      to: receiver.email,
      body,
      replyTo: this.admin.email,
      subject: `${this.admin.fullName} added you to the space "${space.name}"`,
    }
  }
}
