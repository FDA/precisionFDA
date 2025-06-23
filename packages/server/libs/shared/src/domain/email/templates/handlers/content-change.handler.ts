import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ErrorCodes, ValidationError } from '@shared/errors'
import { filter, pipe, uniqBy, isNil } from 'ramda'
import { EmailConfigItem } from '../../email.config'
import { buildIsNotificationEnabled, buildFilterByUserSettings } from '../../email.helper'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '../../../space-event/space-event.enum'
import { newContentTemplate } from '../mjml/new-content.template'
import { User } from '@shared/domain/user/user.entity'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { Injectable } from '@nestjs/common'
import { EmailClient } from '@shared/services/email-client'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { OpsCtx } from '@shared/types'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import {
  ContentChangedContext,
  EmailTypeToContextMap,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class ContentChangedEmailHandler extends EmailHandler<EMAIL_TYPES.newContentAdded> {
  protected emailType = EMAIL_TYPES.newContentAdded as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = newContentTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly spaceEventRepo: SpaceEventRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: ObjectIdInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.newContentAdded]> {
    const spaceEvent = await this.spaceEventRepo.findOneOrFail(
      {
        id: input.id,
      },
      { populate: ['space'] },
    )
    return { input, spaceEvent }
  }

  protected async determineReceivers(context: ContentChangedContext): Promise<User[]> {
    const memberships = await this.spaceMembershipRepo.find(
      { spaces: context.spaceEvent.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )

    const ctx: OpsCtx = {
      em: this.em,
      log: this.logger,
    }
    const config: EmailConfigItem = {
      emailId: this.emailType,
      name: 'newContentAdded',
      handlerClass: ContentChangedEmailHandler,
    }

    // build determine filter functions
    const isEnabledFn = buildIsNotificationEnabled('content_added_or_deleted', ctx)
    const filterFn = buildFilterByUserSettings({ ...ctx, config }, isEnabledFn)
    // fetch users with memberships, filter function should have extra param for it
    // this has to be bound to local
    // maybe remove from base template, maybe we do not need base template
    const filterUsers = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      filter((u: User) => u.id !== context.spaceEvent.user.id),
      uniqBy((user: User) => user.id),
    )
    return filterUsers(memberships)
  }

  protected getSubject(): string {
    return 'Content changed'
  }

  protected getTemplateInput(
    receiver: User,
    context: ContentChangedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.newContentAdded] {
    const action = SPACE_EVENT_ACTIVITY_TYPE[context.spaceEvent.activityType].split('_')[1]
    if (isNil(action)) {
      throw new ValidationError(
        `Action code name ${SPACE_EVENT_ACTIVITY_TYPE[context.spaceEvent.activityType]} is not applicable`,
        { code: ErrorCodes.EMAIL_VALIDATION },
      )
    }
    const objectType = SPACE_EVENT_OBJECT_TYPE[context.spaceEvent.objectType].toLowerCase()
    const content = {
      entityType: context.spaceEvent.entityType,
      action,
      objectType,
      user: {
        fullName: context.spaceEvent.user.unwrap().fullName,
      },
      space: {
        name: context.spaceEvent.space.unwrap().name,
        id: context.spaceEvent.space.id,
      },
    }
    return {
      receiver,
      content,
    }
  }
}
