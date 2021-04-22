import { LoadedReference } from '@mikro-orm/core'
import { pipe, filter, uniqBy } from 'ramda'
import { Comment, SpaceEvent, Space, User, SpaceMembership } from '../../..'
import {
  CommentAdded,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'
import { BaseTemplate } from '../base-template'
import { commentAddedTemplate, CommentAddedTemplateInput } from '../mjml/comment-added.template'

export class CommentAddedEmailHandler extends BaseTemplate<CommentAdded> implements EmailTemplate {
  templateFile = commentAddedTemplate
  comment: Comment & { user: LoadedReference<User, User> }
  spaceEvent: SpaceEvent & { space: LoadedReference<Space, Space> }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'comment_activity'
  }

  async setupContext(): Promise<void> {
    this.spaceEvent = await this.ctx.em.findOneOrFail(
      SpaceEvent,
      { id: this.validatedInput.spaceEventId },
      { populate: ['space'] },
    )

    this.comment = await this.ctx.em.findOneOrFail(
      Comment,
      { id: this.spaceEvent.entityId },
      { populate: ['user'] },
    )
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.spaceEvent.space.id, active: true },
      { populate: ['user.emailNotificationSettings'] },
    )
    const isEnabledFn = buildIsNotificationEnabled(this.getNotificationKey(), this.ctx)
    const filterFn = buildFilterByUserSettings({ ...this.ctx, config: this.config }, isEnabledFn)
    const spaceEventCreatorId = this.spaceEvent.user.id

    const filterPipe = pipe(
      // SpaceMembership[] -> User[]
      filterFn,
      filter((u: User) => u.id !== spaceEventCreatorId),
      uniqBy((u: User) => u.id),
    )
    return filterPipe(memberships)
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const body = buildEmailTemplate<CommentAddedTemplateInput>(this.templateFile, {
      receiver,
      content: {
        initiator: { fullName: this.comment.user.unwrap().fullName },
        comment: { body: this.comment.body },
      },
    })
    return {
      to: receiver.email,
      body,
      subject: `${this.comment.user.unwrap().fullName} added a comment`,
    }
  }
}
