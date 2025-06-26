import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { spaceActivationTemplate } from '@shared/domain/email/templates/mjml/space-activation.template'
import { User } from '@shared/domain/user/user.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { config } from '@shared/config'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import {
  EmailTypeToContextMap,
  SpaceActivationContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class SpaceActivationEmailHandler extends EmailHandler<EMAIL_TYPES.spaceActivation> {
  protected emailType = EMAIL_TYPES.spaceActivation as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = spaceActivationTemplate

  constructor(
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.spaceActivation]> {
    const spaceMembership = await this.spaceMembershipRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['user', 'spaces'] },
    )
    return { input, spaceMembership }
  }

  protected async determineReceivers(context: SpaceActivationContext): Promise<User[]> {
    return [context.spaceMembership.user.getEntity()]
  }

  protected getSubject(_receiver: User, context: SpaceActivationContext): string {
    return `Action required to activate new space ${context.spaceMembership.spaces[0].name}`
  }

  protected getTemplateInput(
    receiver: User,
    context: SpaceActivationContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceActivation] {
    const space = context.spaceMembership.spaces[0]
    let activationRequestLead: string
    let leadsNames: string
    if (space.type === SPACE_TYPE.ADMINISTRATOR) {
      activationRequestLead =
        context.spaceMembership.side === SPACE_MEMBERSHIP_SIDE.HOST ? 'creator' : 'approver'
      leadsNames = 'creator and approver'
    } else {
      activationRequestLead = context.spaceMembership.getSpaceMembershipSideAlias()
      leadsNames = 'host and guest'
    }

    return {
      spaceTitle: space.name,
      activationRequestLead,
      spaceUrl: `${config.api.railsHost}/spaces/${context.spaceMembership.spaces[0].id}`,
      isReviewSpace: space.type === SPACE_TYPE.REVIEW,
      leadsNames,
      receiver,
    }
  }
}
