import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { spaceActivatedTemplate } from '@shared/domain/email/templates/mjml/space-activated.template'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import {
  EmailTypeToContextMap,
  SpaceActivatedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

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
    receiver: User,
    context: SpaceActivatedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceActivated] {
    const space = context.spaceMembership.spaces[0]
    return {
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      spaceTitle: space.name,
      spaceUrl: `${config.api.railsHost}/spaces/${space.id}`,
      receiver,
    }
  }
}
