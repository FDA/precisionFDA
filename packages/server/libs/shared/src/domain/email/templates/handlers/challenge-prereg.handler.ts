import { LoadedReference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeCreatedDTO } from '@shared/domain/email/dto/challenge-created.dto'
import { ChallengePreregContext, EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { STATIC_SCOPE } from '@shared/enums'
import { InternalError } from '@shared/errors'
import { EmailClient } from '@shared/services/email-client'
import { getIdFromScopeName, scopeContainsId } from '../../../space/space.helper'
import { pfdaNoReplyUser } from '../../email.helper'
import { challengePreregTemplate } from '../mjml/challenge-preregister.template'

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
      users = await this.userRepo.findActive({ populate: ['notificationPreference'] })
    } else if (scopeContainsId(context.input.scope)) {
      // find space, memberships, inform only those users
      const spaceId = getIdFromScopeName(context.input.scope)
      const memberships = await this.spaceMembershipRepo.find(
        { spaces: spaceId, active: true },
        { populate: ['user.notificationPreference'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map((m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap())
    } else {
      throw new InternalError(`Scope name ${context.input.scope} is not processable`)
    }
    return users.concat(pfdaNoReplyUser)
  }

  protected async getNotificationSettingKeys(): Promise<string[]> {
    return ['private_challenge_preregister']
  }

  protected getSubject(context: ChallengePreregContext): string {
    return `Challenge ${context.input.name} preregistration opened`
  }

  protected getTemplateInput(
    context: ChallengePreregContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.challengePrereg] {
    return {
      firstName: receiver?.firstName,
      content: {
        challenge: { name: context.input.name, id: context.input.challengeId },
      },
    }
  }
}
