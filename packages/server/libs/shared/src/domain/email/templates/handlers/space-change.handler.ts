import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes, NotFoundError } from '@shared/errors'
import { pipe, filter, uniqBy } from 'ramda'
import {
  EmailSendInput,
  EmailTemplate,
  SpaceChanged,
  NOTIFICATION_TYPES_BASE,
  EMAIL_TYPES,
} from '../../email.config'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { SpaceChangeTemplateInput, spaceChangedTemplate } from '../mjml/space-change.template'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'
import { SPACE_MEMBERSHIP_SIDE } from '../../../space-membership/space-membership.enum'

export class SpaceChangedEmailHandler
  extends BaseTemplate<SpaceChanged>
  implements EmailTemplate<SpaceChangeTemplateInput>
{
  templateFile = spaceChangedTemplate
  space: Space
  user: User
  receiversSides: object

  // to take away the following?
  spaceMembership: SpaceMembership
  spaceMembershipSide: string | object
  receiverMembershipSide: string | object

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_locked_unlocked_deleted'
  }

  async setupContext(): Promise<void> {
    this.space = await this.ctx.em.findOneOrFail(Space, {
      id: this.validatedInput.spaceId,
    })
    if (!this.space) {
      throw new NotFoundError(`Space id ${this.validatedInput.spaceId.toString()} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }
    this.user = await this.ctx.em.findOneOrFail(User, { id: this.validatedInput.initUserId })
    if (!this.user) {
      throw new NotFoundError(`User id ${this.validatedInput.initUserId.toString()} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }

    const spaceMemberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    const spaceMembership = spaceMemberships.filter((memberShip) => {
      if (memberShip.user.id === this.user.id) {
        return memberShip
      }
    })

    this.spaceMembership = spaceMembership[0] // future need
    if (spaceMembership[0]) {
      this.spaceMembershipSide = SPACE_MEMBERSHIP_SIDE[spaceMembership[0].side]
    }
    this.receiverMembershipSide = {} // future need
    this.receiversSides = {}
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    const spaceEventUserId = this.user.id

    // this has to be bound to local
    const filterUsers = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      // this user triggered the SpaceEvent
      filter((u: User) => u.id !== spaceEventUserId),
      uniqBy((user: User) => user.id),
    )
    const receivers = filterUsers(memberships)
    // based on email type, find who will be the receiver
    // users who are in the space + active ?
    const receiversSidesArr = receivers.map((a) => [
      a.id.toString(),
      // @ts-ignore
      SPACE_MEMBERSHIP_SIDE[memberships.find((membership) => membership.user.id === a.id).side],
    ])
    // @ts-ignore
    this.receiversSides = Object.fromEntries(receiversSidesArr)
    const receiverMembership = memberships.filter((membership) => {
      if (receivers && membership.user.id === receivers[0].id) {
        return membership
      }
    })
    this.receiverMembershipSide = SPACE_MEMBERSHIP_SIDE[receiverMembership[0]?.side]

    return receivers
  }

  async getTemplateContent(): Promise<SpaceChangeTemplateInput['content']> {
    // todo: validate the incoming action?
    const actionKey = this.validatedInput.activityType
    const action = actionKey.split('_').slice(1).join(' ')

    return {
      space: { name: this.space.name, id: this.space.id },
      action,
      initiator: { fullName: this.user.fullName },
      spaceMembership: { side: this.spaceMembership ? this.spaceMembership.side : undefined },
      spaceMembershipSide: this.spaceMembershipSide.toString(),
      receiverMembershipSide: this.receiverMembershipSide.toString(),
      receiversSides: this.receiversSides,
    }
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const content = await this.getTemplateContent()
    const body = buildEmailTemplate<SpaceChangeTemplateInput>(this.templateFile, {
      receiver,
      content,
    })
    return {
      emailType: EMAIL_TYPES.spaceChanged,
      to: receiver.email,
      body,
      subject: `${content.initiator.fullName} ${content.action} the space ${content.space.name}`,
    }
  }
}
