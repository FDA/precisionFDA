import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailTypeToContextMap, SpaceActivatedContext } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { spaceActivatedTemplate } from '@shared/domain/email/templates/mjml/space-activated.template'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { EmailClient } from '@shared/services/email-client'

@Injectable()
export class SpaceActivatedHandler extends EmailHandler<EMAIL_TYPES.spaceActivated> {
  protected emailType = EMAIL_TYPES.spaceActivated as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = spaceActivatedTemplate

  constructor(
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.spaceActivated]> {
    const spaceMembership = await this.spaceMembershipRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['user', 'spaces'] },
    )
    return { input, spaceMembership }
  }

  protected async determineReceivers(context: SpaceActivatedContext): Promise<User[]> {
    return [context.spaceMembership.user.getEntity()]
  }

  protected getSubject(): string {
    return 'Space Activated'
  }

  protected getTemplateInput(
    context: SpaceActivatedContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceActivated] {
    const space = context.spaceMembership.spaces[0]
    return {
      firstName: receiver?.firstName,
      lastName: receiver?.lastName,
      spaceTitle: space.name,
      spaceUrl: `${config.api.railsHost}/spaces/${space.id}`,
    }
  }
}
