import { LoadedReference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeOpenedDTO } from '@shared/domain/email/dto/challenge-opened.dto'
import { ChallengeOpenedContext, EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { InternalError } from '@shared/errors'
import { EmailClient } from '@shared/services/email-client'
import { pfdaNoReplyUser } from '../../email.helper'
import { challengeOpenedTemplate } from '../mjml/challenge-opened.template'

@Injectable()
export class ChallengeOpenedEmailHandler extends EmailHandler<EMAIL_TYPES.challengeOpened> {
  protected emailType = EMAIL_TYPES.challengeOpened as const
  protected inputDto = ChallengeOpenedDTO
  protected getBody = challengeOpenedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly challengeRepo: ChallengeRepository,
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ChallengeOpenedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.challengeOpened]> {
    const challenge = await this.challengeRepo.findOneOrFail({
      id: input.challengeId,
    })
    return { challenge, input }
  }

  protected async determineReceivers(context: ChallengeOpenedContext): Promise<User[]> {
    let users: User[]
    if (context.challenge.isPublic()) {
      // all active users
      users = await this.userRepo.findActive({ populate: ['notificationPreference'] })
    } else if (context.challenge.isInSpace()) {
      // find space, memberships, inform only those users
      const memberships = await this.spaceMembershipRepo.find(
        { spaces: context.challenge.getSpaceId(), active: true },
        { populate: ['user.notificationPreference'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map((m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap())
    } else {
      throw new InternalError(`Scope name ${context.challenge.scope} is not processable`)
    }
    return users.concat(pfdaNoReplyUser)
  }

  protected getSubject(context: ChallengeOpenedContext): string {
    return `New challenge ${context.challenge.name}`
  }

  protected async getNotificationSettingKeys(): Promise<string[]> {
    return ['private_challenge_opened']
  }

  protected getTemplateInput(
    context: ChallengeOpenedContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.challengeOpened] {
    return {
      firstName: receiver?.firstName,
      content: {
        challenge: { name: context.challenge.name, id: context.challenge.id },
      },
    }
  }
}
