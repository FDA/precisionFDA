import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailTypeToContextMap, SpaceInvitationContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { InvitationToSpaceDTO } from '@shared/domain/email/dto/invitation-to-space.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { spaceInvitationTemplate } from '@shared/domain/email/templates/mjml/space-invitation.template'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'

@Injectable()
export class SpaceInvitationHandler extends EmailHandler<EMAIL_TYPES.spaceInvitation> {
  protected emailType = EMAIL_TYPES.spaceInvitation as const
  protected inputDto = InvitationToSpaceDTO
  protected getBody = spaceInvitationTemplate

  constructor(
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: InvitationToSpaceDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.spaceInvitation]> {
    const membership = await this.spaceMembershipRepo.findOneOrFail(
      {
        id: input.membershipId,
      },
      { populate: ['spaces', 'user'] },
    )
    const admin = await this.userRepo.findOneOrFail({ id: input.adminId })
    return { input, membership, admin }
  }

  protected async determineReceivers(context: SpaceInvitationContext): Promise<User[]> {
    return [context.membership.user.getEntity()]
  }

  protected getTemplateInput(
    context: SpaceInvitationContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceInvitation] {
    const space = context.membership.spaces[0]
    return {
      spaceTitle: space.name,
      adminFullName: `${context.admin.fullName}`,
      membershipRoleAlias: context.membership.getSpaceMembershipRoleAlias(),
      membershipSideAlias: context.membership.getSpaceMembershipSideAlias(),
      spaceUrl: `${config.api.railsHost}/spaces/${space.id}`,
      adminUserUrl: `${config.api.railsHost}/users/${context.admin.dxuser}`,
    }
  }

  protected getSubject(context: SpaceInvitationContext): string {
    const space = context.membership.spaces[0]
    return `${context.admin.fullName} added you to the space "${space.name}"`
  }

  protected getReplyTo(context: SpaceInvitationContext): string {
    return context.admin.email
  }
}
