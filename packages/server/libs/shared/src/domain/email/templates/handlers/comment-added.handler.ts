import { LoadedReference } from '@mikro-orm/core'
import { App } from '@shared/domain/app/app.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { pipe, filter, uniqBy } from 'ramda'
import {
  CommentAdded,
  EmailSendInput,
  EmailTemplate,
  EMAIL_TYPES,
  NOTIFICATION_TYPES_BASE,
} from '../../email.config'
import {
  buildEmailTemplate,
  buildFilterByUserSettings,
  buildIsNotificationEnabled,
} from '../../email.helper'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { commentAddedTemplate, CommentAddedTemplateInput } from '../mjml/comment-added.template'
import { generateObjectCommentsLink } from '../mjml/common'

export class CommentAddedEmailHandler extends BaseTemplate<CommentAdded> implements EmailTemplate {
  templateFile = commentAddedTemplate
  comment: Comment & { user: LoadedReference<User> }
  spaceEvent: SpaceEvent & { space: LoadedReference<Space> }
  userFile: UserFile & { user: LoadedReference<User> }
  app: App & { user: LoadedReference<User> }
  job: Job & { user: LoadedReference<User> }
  // to add workflow commenting in Home refactoring, on Rails side
  // workflow: Workflow
  objectCommentsLink: any

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

    switch (this.comment.contentObjectType) {
      case 'Node':
        this.userFile = await this.ctx.em.findOneOrFail(
          UserFile,
          { id: this.comment.contentObjectId },
          { populate: ['user'] },
        );
        this.objectCommentsLink = generateObjectCommentsLink(
          'files',
          this.userFile.uid,
        )
        return this.objectCommentsLink
      case 'App':
        this.app = await this.ctx.em.findOneOrFail(
          App,
          { id: this.comment.contentObjectId },
          { populate: ['user'] },
        )
        this.objectCommentsLink = generateObjectCommentsLink(
          'apps',
          this.app.uid,
        )
        return this.objectCommentsLink
      case 'Job':
        this.job = await this.ctx.em.findOneOrFail(
          Job,
          { id: this.comment.contentObjectId },
          { populate: ['user'] },
        );
        this.objectCommentsLink = generateObjectCommentsLink(
          'jobs',
          this.job.uid,
        )
        return this.objectCommentsLink
      // to do before: Workflow commenting fix on Rails side in Home refactoring,
      // case 'Workflow':
      //   this.workflow = await this.ctx.em.findOneOrFail(
      //     Workflow,
      //     { id: this.comment.contentObjectId },
      //     { populate: ['user'] },
      //   );
      //   this.objectCommentsLink = generateObjectCommentsLink(
      //     'workflows',
      //     this.workflow.uid,
      //   )
      //   console.log("In CommentAddedEmailHandler: Workflow this.objectCommentsLink = ",this.objectCommentsLink)
      //   return this.objectCommentsLink
      // default: return;
    }
  }

  async determineReceivers(): Promise<User[]> {
    const memberships = await this.ctx.em.find(
      SpaceMembership,
      { spaces: this.spaceEvent.space.id, active: true },
      { populate: ['user.notificationPreference'] },
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
        comment: {
          body: this.comment.body,
          id: this.comment.id,
          contentObjectId: this.comment.contentObjectId,
          contentObjectType: this.comment.contentObjectType,
        },
        space: { id: this.spaceEvent.space.id },
        objectCommentsLink: this.objectCommentsLink,
      },
    })
    return {
      emailType: EMAIL_TYPES.commentAdded,
      to: receiver.email,
      body,
      subject: `${this.comment.user.unwrap().fullName} added a comment`,
    }
  }
}