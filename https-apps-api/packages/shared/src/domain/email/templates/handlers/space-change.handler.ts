import { pipe, filter, uniqBy } from 'ramda'
import { errors } from '../../../..'
import { User, SpaceMembership, Space } from '../../..'
import {
  EmailSendInput,
  EmailTemplate,
  SpaceChanged,
  NOTIFICATION_TYPES_BASE,
  EMAIL_TYPES,
} from '../../email.config'
import { BaseTemplate } from '../base-template'
import { SpaceChangeTemplateInput, spaceChangedTemplate } from '../mjml/space-change.template'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'
import { LoadedReference } from '@mikro-orm/core'
import { SPACE_MEMBERSHIP_SIDE } from '../../../space-membership/space-membership.enum'

export class SpaceChangedEmailHandler extends BaseTemplate<SpaceChanged> implements EmailTemplate {
  templateFile = spaceChangedTemplate
  space: Space
  user: User
  receiversSides: any

  // to take away the following?
  spaceMembership: SpaceMembership & { user: LoadedReference<User> } & { space: LoadedReference<Space> }
  spaceMembershipSide: any
  receiverMembershipSide: any

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'space_locked_unlocked_deleted'
  }

  async setupContext(): Promise<void> {
    this.space = await this.ctx.em.findOneOrFail(Space, {
      id: this.validatedInput.spaceId,
    })
    if (!this.space) {
      throw new errors.NotFoundError(
        `Space id ${this.validatedInput.spaceId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }
    this.user = await this.ctx.em.findOneOrFail(User, { id: this.validatedInput.initUserId })
    if (!this.user) {
      throw new errors.NotFoundError(
        `User id ${this.validatedInput.initUserId.toString()} not found`,
        { code: errors.ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND },
      )
    }

    const spaceMemberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )

    const spaceMembership: any = spaceMemberships.filter(memberShip => {
      if (memberShip.user.id === this.user.id) {
        return memberShip
      }
    })

    this.spaceMembership = spaceMembership[0] // future need
    this.spaceMembershipSide = spaceMembership[0] ? SPACE_MEMBERSHIP_SIDE[spaceMembership[0].side] : undefined // no need
    this.receiverMembershipSide = {} // future need
    this.receiversSides = {}
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
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
    const receiversSidesArr = receivers.map(a =>
      [
        a.id.toString(),
        // @ts-ignore
        SPACE_MEMBERSHIP_SIDE[memberships.find(membership => membership.user.id === a.id).side]
      ]
    )
    // @ts-ignore
    this.receiversSides = Object.fromEntries(receiversSidesArr)
    const receiverMembership: any = memberships.filter(membership => {
      if (receivers && membership.user.id === receivers[0].id) {
        return membership
      }
    })
    this.receiverMembershipSide = SPACE_MEMBERSHIP_SIDE[receiverMembership[0].side]

    return receivers
  }

  // eslint-disable-next-line @typescript-eslint/require-await, require-await
  async getTemplateContent(): Promise<SpaceChangeTemplateInput['content']> {
    // todo: validate the incoming action?
    const actionKey = this.validatedInput.activityType
    const action = actionKey.split('_').slice(1).join(' ')

    return {
      space: { name: this.space.name, id: this.space.id },
      action,
      initiator: { fullName: this.user.fullName },
      spaceMembership: { side: this.spaceMembership ? this.spaceMembership.side : undefined },
      spaceMembershipSide: this.spaceMembershipSide,
      receiverMembershipSide: this.receiverMembershipSide,
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
