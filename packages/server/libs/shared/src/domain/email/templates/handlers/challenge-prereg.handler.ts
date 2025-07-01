import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { LoadedReference } from '@mikro-orm/core'
import { STATIC_SCOPE } from '@shared/enums'
import { pfdaNoReplyUser } from '../../email.helper'
import { challengePreregTemplate } from '../mjml/challenge-preregister.template'
import { InternalError } from '@shared/errors'
import { getIdFromScopeName, scopeContainsId } from '../../../space/space.helper'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { ChallengeCreatedDTO } from '@shared/domain/email/dto/challenge-created.dto'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EmailClient } from '@shared/services/email-client'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import {
  ChallengeOpenedContext,
  ChallengePreregContext,
  EmailTypeToContextMap,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class ChallengePreregEmailHandler extends EmailHandler<EMAIL_TYPES.challengePrereg> {
  protected emailType = EMAIL_TYPES.challengePrereg as const
  protected inputDto = ChallengeCreatedDTO
  protected getBody = challengePreregTemplate

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
    input: ChallengeCreatedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.challengePrereg]> {
    const challenge = await this.challengeRepo.findOneOrFail({
      id: input.challengeId,
    })
    return {
      challenge,
      input,
    }
  }

  protected async determineReceivers(context: ChallengePreregContext): Promise<User[]> {
    let users: User[]
    if (context.input.scope === STATIC_SCOPE.PUBLIC) {
      // all active users
      users = await this.userRepo.findActive({ populate: ['notificationPreference'] as never[] })
    } else if (scopeContainsId(context.input.scope)) {
      // find space, memberships, inform only those users
      const spaceId = getIdFromScopeName(context.input.scope)
      const memberships = await this.spaceMembershipRepo.find(
        { spaces: spaceId, active: true },
        { populate: ['user.notificationPreference'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map(
        (m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap(),
      )
    } else {
      throw new InternalError(`Scope name ${context.input.scope} is not processable`)
    }
    return users.concat(pfdaNoReplyUser)
  }

  protected async getNotificationSettingKeys(
    _context: ChallengeOpenedContext,
    _user: User,
  ): Promise<string[]> {
    return ['private_challenge_preregister']
  }

  protected getSubject(_receiver: User, context: ChallengePreregContext): string {
    return `Challenge ${context.input.name} preregistration opened`
  }

  protected getTemplateInput(
    receiver: User,
    context: ChallengePreregContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.challengePrereg] {
    return {
      receiver,
      content: {
        challenge: { name: context.input.name, id: context.input.challengeId },
      },
    }
  }
}
