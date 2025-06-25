import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { pipe, uniqBy } from 'ramda'
import { LoadedReference } from '@mikro-orm/core'
import { EmailConfigItem } from '../../email.config'
import {
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
  pfdaNoReplyUser,
} from '../../email.helper'
import { challengeOpenedTemplate } from '../mjml/challenge-opened.template'
import { InternalError } from '@shared/errors'
import { ChallengeOpenedDTO } from '@shared/domain/email/dto/challenge-opened.dto'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { OpsCtx } from '@shared/types'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  ChallengeOpenedContext,
  EmailTypeToContextMap,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

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
      users = await this.userRepo.findActive({ populate: ['notificationPreference'] as never[] })
    } else if (context.challenge.isInSpace()) {
      // find space, memberships, inform only those users
      const memberships = await this.spaceMembershipRepo.find(
        { spaces: context.challenge.getSpaceId(), active: true },
        { populate: ['user.notificationPreference'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map(
        (m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap(),
      )
    } else {
      throw new InternalError(`Scope name ${context.challenge.scope} is not processable`)
    }
    const ctx: OpsCtx = {
      em: this.em,
      log: this.logger,
    }
    const config: EmailConfigItem = {
      emailId: this.emailType,
      name: 'challengeOpened',
      handlerClass: ChallengeOpenedEmailHandler,
    }
    const isEnabledFn = buildIsNotificationEnabled('challenge_opened', ctx)
    const filterFn = buildFilterByUserSettings({ ...ctx, config }, isEnabledFn)
    const filterPipe = pipe(
      // User[] -> User[]
      filterFn,
      uniqBy((u: User) => u.id),
    )
    return filterPipe(users).concat(pfdaNoReplyUser)
  }

  protected getSubject(_receiver: User, context: ChallengeOpenedContext): string {
    return `New challenge ${context.challenge.name}`
  }

  protected getTemplateInput(
    receiver: User,
    context: ChallengeOpenedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.challengeOpened] {
    return {
      receiver,
      content: {
        challenge: { name: context.challenge.name, id: context.challenge.id },
      },
    }
  }
}
