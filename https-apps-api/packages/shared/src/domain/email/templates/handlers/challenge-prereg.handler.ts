import { pipe, uniqBy } from 'ramda'
import { LoadedReference } from '@mikro-orm/core'
import { STATIC_SCOPE } from '../../../../enums'
import { Challenge, SpaceMembership, User } from '../../..'
import {
  EmailTemplate,
  ChallengeCreated,
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
import { BaseTemplate } from '../base-template'
import {
  challengePreregTemplate,
  ChallengePreregTemplateInput,
} from '../mjml/challenge-preregister.template'
import { InternalError } from '../../../../errors'
import { getIdFromScopeName, isValidScopeName } from '../../../space/space.helper'

export class ChallengePreregEmailHandler
  extends BaseTemplate<ChallengeCreated>
  implements EmailTemplate {
  templateFile = challengePreregTemplate
  challenge: Challenge | null

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'challenge_preregister'
  }

  async setupContext(): Promise<void> {
    // if challenge is just created this can be null
    this.challenge = await this.ctx.em.findOne(Challenge, {
      id: this.validatedInput.challengeId,
    })
    if (!this.challenge) {
      this.ctx.log.info(
        { challengeId: this.validatedInput.challengeId },
        'Email handler runs, challenge not created yet',
      )
    }
  }

  async determineReceivers(): Promise<User[]> {
    const userRepo = this.ctx.em.getRepository(User)
    let users: User[]
    if (this.validatedInput.scope === STATIC_SCOPE.PUBLIC) {
      // all active users
      users = await userRepo.findActive({ populate: ['emailNotificationSettings'] as never[] })
    } else if (isValidScopeName(this.validatedInput.scope)) {
      // find space, memberships, inform only those users
      const spaceId = getIdFromScopeName(this.validatedInput.scope)
      const memberships = await this.ctx.em.find(
        SpaceMembership,
        { spaces: spaceId, active: true },
        { populate: ['user.emailNotificationSettings'] },
      )
      // todo: should filter out active users as well .. probably redundant (if they can be added to space)
      users = memberships.map(
        (m: SpaceMembership & { user: LoadedReference<User> }): User => m.user.unwrap(),
      )
    } else {
      throw new InternalError(`Scope name ${this.validatedInput.scope} is not processable`)
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
    const body = buildEmailTemplate<ChallengePreregTemplateInput>(this.templateFile, {
      receiver,
      content: {
        challenge: { name: this.validatedInput.name, id: this.validatedInput.challengeId },
      },
    })
    return {
      emailType: EMAIL_TYPES.challengePrereg,
      to: receiver.email,
      body,
      subject: `Challenge ${this.validatedInput.name} preregistration opened`,
    }
  }
}
