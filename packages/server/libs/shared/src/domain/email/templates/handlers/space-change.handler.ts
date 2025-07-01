import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes, NotFoundError } from '@shared/errors'
import { pipe, filter, uniqBy } from 'ramda'
import { EmailConfigItem } from '../../email.config'
import { spaceChangedTemplate } from '../mjml/space-change.template'
import { buildFilterByUserSettings, buildIsNotificationEnabled } from '../../email.helper'
import { SPACE_MEMBERSHIP_SIDE } from '../../../space-membership/space-membership.enum'
import { SpaceChangedDTO } from '@shared/domain/email/dto/space-changed.dto'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { OpsCtx } from '@shared/types'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { Injectable } from '@nestjs/common'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  EmailTypeToContextMap,
  SpaceChangedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'

@Injectable()
export class SpaceChangedEmailHandler extends EmailHandler<EMAIL_TYPES.spaceChanged> {
  protected emailType = EMAIL_TYPES.spaceChanged as const
  protected inputDto = SpaceChangedDTO
  protected getBody = spaceChangedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly spaceRepo: SpaceRepository,
    protected readonly userRepo: UserRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: SpaceChangedDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.spaceChanged]> {
    const space = await this.spaceRepo.findOneOrFail({
      id: input.spaceId,
    })
    if (!space) {
      throw new NotFoundError(`Space id ${input.spaceId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }
    const user = await this.userRepo.findOneOrFail({ id: input.initUserId })
    if (!user) {
      throw new NotFoundError(`User id ${input.initUserId} not found`, {
        code: ErrorCodes.EMAIL_PAYLOAD_NOT_FOUND,
      })
    }

    const spaceMemberships = await this.spaceMembershipRepo.find(
      { spaces: space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    const spaceMembership = spaceMemberships.find((membership) => membership.user.id === user.id)

    let spaceMembershipSide = {}
    if (spaceMemberships[0]) {
      spaceMembershipSide = SPACE_MEMBERSHIP_SIDE[spaceMemberships[0].side]
    }
    const receiverMembershipSide = {} // future need
    const receiversSides = {}

    return {
      input,
      space,
      user,
      receiversSides,
      spaceMembership,
      spaceMembershipSide,
      receiverMembershipSide,
    }
  }

  protected async determineReceivers(context: SpaceChangedContext): Promise<User[]> {
    const memberships = await this.spaceMembershipRepo.find(
      { spaces: context.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )
    const ctx: OpsCtx = {
      em: this.em,
      log: this.logger,
    }
    const config: EmailConfigItem = {
      emailId: this.emailType,
      name: 'spaceChanged',
      handlerClass: SpaceChangedEmailHandler,
    }
    const isEnabledFn = buildIsNotificationEnabled('space_locked_unlocked_deleted', ctx)
    const filterFn = buildFilterByUserSettings({ ...ctx, config: config }, isEnabledFn)
    const spaceEventUserId = context.user.id

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
      SPACE_MEMBERSHIP_SIDE[memberships.find((membership) => membership.user.id === a.id).side],
    ])
    context.receiversSides = Object.fromEntries(receiversSidesArr)
    const receiverMembership = memberships.filter((membership) => {
      if (receivers && membership.user.id === receivers[0].id) {
        return membership
      }
    })
    context.receiverMembershipSide = SPACE_MEMBERSHIP_SIDE[receiverMembership[0]?.side]

    return receivers
  }

  private getAction(activityType: string): string {
    return activityType.split('_').slice(1).join(' ')
  }

  protected getTemplateInput(
    receiver: User,
    context: SpaceChangedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.spaceChanged] {
    const action = this.getAction(context.input.activityType)
    return {
      content: {
        space: { name: context.space.name, id: context.space.id },
        action,
        initiator: { fullName: context.user.fullName },
        spaceMembership: {
          side: context.spaceMembership ? context.spaceMembership.side : undefined,
        },
        spaceMembershipSide: context.spaceMembershipSide.toString(),
        receiverMembershipSide: context.receiverMembershipSide.toString(),
        receiversSides: context.receiversSides,
      },
      receiver,
    }
  }

  protected getSubject(_receiver: User, context: SpaceChangedContext): string {
    return `${context.user.fullName} ${this.getAction(context.input.activityType)} the space ${context.space.name}`
  }
}
