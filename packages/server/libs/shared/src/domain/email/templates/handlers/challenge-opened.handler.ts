import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { pipe, uniqBy } from 'ramda'
import { LoadedReference } from '@mikro-orm/core'
import { STATIC_SCOPE } from '../../../../enums'
import {
  EmailTemplate,
  ChallengeOpened,
  NOTIFICATION_TYPES_BASE,
  EmailSendInput,
  EMAIL_TYPES,
} from '../../email.config'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
  pfdaNoReplyUser,
} from '../../email.helper'
import {
  challengeOpenedTemplate,
  ChallengeOpenedTemplateInput,
} from '../mjml/challenge-opened.template'
import { InternalError } from '../../../../errors'
import { getIdFromScopeName, scopeContainsId } from '../../../space/space.helper'

export class ChallengeOpenedEmailHandler
  extends BaseTemplate<ChallengeOpened>
  implements EmailTemplate {
  templateFile = challengeOpenedTemplate
  challenge: Challenge

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'challenge_opened'
  }

  async setupContext(): Promise<void> {
    this.challenge = await this.ctx.em.findOneOrFail(Challenge, {
      id: this.validatedInput.challengeId,
    })
  }

  async determineReceivers(): Promise<User[]> {
    const userRepo = this.ctx.em.getRepository(User)
    let users: User[]
    if (this.challenge.scope === STATIC_SCOPE.PUBLIC) {
      // all active users
      users = await userRepo.findActive({ populate: ['notificationPreference'] as never[] })
    } else if (scopeContainsId(this.challenge.scope)) {
      // find space, memberships, inform only those users
      const spaceId = getIdFromScopeName(this.challenge.scope)
      const memberships = await this.ctx.em.find(
        SpaceMembership,
        { spaces: spaceId, active: true },
        { populate: ['user.notificationPreference'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map(
        (m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap(),
      )
    } else {
      throw new InternalError(`Scope name ${this.challenge.scope} is not processable`)
    }
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    const filterPipe = pipe(
      // User[] -> User[]
      filterFn,
      uniqBy((u: User) => u.id),
    )
    const interestedUsers = filterPipe(users).concat(pfdaNoReplyUser)
    return interestedUsers
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<ChallengeOpenedTemplateInput>(this.templateFile, {
      receiver,
      content: {
        challenge: { name: this.challenge.name, id: this.challenge.id },
      },
    })
    return {
      emailType: EMAIL_TYPES.challengeOpened,
      to: receiver.email,
      body,
      subject: `New challenge ${this.challenge.name}`,
    }
  }
}
