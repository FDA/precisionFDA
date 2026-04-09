import { LoadedReference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { AppRepository } from '@shared/domain/app/app.repository'
import { CommentRepository } from '@shared/domain/comment/comment.repository'
import { CommentAddedContext, EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { generateObjectCommentsLink } from '@shared/domain/email/templates/mjml/common'
import { Job } from '@shared/domain/job/job.entity'
import { JobRepository } from '@shared/domain/job/job.repository'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { EmailClient } from '@shared/services/email-client'
import { getKeyForUserSpaceRole } from '../../email.helper'
import { commentAddedTemplate } from '../mjml/comment-added.template'

@Injectable()
export class CommentAddedEmailHandler extends EmailHandler<EMAIL_TYPES.commentAdded> {
  protected emailType = EMAIL_TYPES.commentAdded as const
  protected inputDto = ObjectIdInputDTO
  protected getBody = commentAddedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly spaceEventRepo: SpaceEventRepository,
    protected readonly commentRepo: CommentRepository,
    protected readonly userFileRepo: UserFileRepository,
    protected readonly appRepo: AppRepository,
    protected readonly jobRepo: JobRepository,
    protected readonly spaceMembershipRepo: SpaceMembershipRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(input: ObjectIdInputDTO): Promise<EmailTypeToContextMap[EMAIL_TYPES.commentAdded]> {
    const spaceEvent = await this.spaceEventRepo.findOneOrFail({ id: input.id }, { populate: ['space'] })

    const comment = await this.commentRepo.findOneOrFail({ id: spaceEvent.entityId }, { populate: ['user'] })

    let userFile: (UserFile & { user: LoadedReference<User> }) | undefined
    let app: (App & { user: LoadedReference<User> }) | undefined
    let job: (Job & { user: LoadedReference<User> }) | undefined
    let objectCommentsLink: string | undefined

    switch (comment.contentObjectType) {
      case 'Node':
        userFile = await this.userFileRepo.findOneOrFail({ id: comment.contentObjectId }, { populate: ['user'] })
        objectCommentsLink = generateObjectCommentsLink('files', userFile.uid)
        break
      case 'App':
        app = await this.appRepo.findOneOrFail({ id: comment.contentObjectId }, { populate: ['user'] })
        objectCommentsLink = generateObjectCommentsLink('apps', app.uid)
        break
      case 'Job':
        job = await this.jobRepo.findOneOrFail({ id: comment.contentObjectId }, { populate: ['user'] })
        objectCommentsLink = generateObjectCommentsLink('jobs', job.uid)
        break
    }

    return {
      comment,
      spaceEvent,
      userFile,
      app,
      job,
      objectCommentsLink,
      input,
    }
  }

  protected async getNotificationSettingKeys(
    context: EmailTypeToContextMap[EMAIL_TYPES.commentAdded],
    user: User,
  ): Promise<string[]> {
    const space = context.spaceEvent.space.getEntity()
    await space.spaceMemberships.loadItems()
    const spaceMembership = space.spaceMemberships
      .getItems()
      .filter(spaceMembership => spaceMembership.active === true && spaceMembership.user.getEntity().id === user.id)

    if (Array.isArray(spaceMembership) && spaceMembership.length > 0) {
      return [getKeyForUserSpaceRole(spaceMembership[0], 'comment_activity', space)]
    }
  }

  protected async determineReceivers(context: CommentAddedContext): Promise<User[]> {
    const memberships = await this.spaceMembershipRepo.find(
      { spaces: context.spaceEvent.space.id, active: true },
      { populate: ['user.notificationPreference'] },
    )
    const spaceEventCreatorId = context.spaceEvent.user.id
    return memberships.map(membership => membership.user.getEntity()).filter(user => user.id !== spaceEventCreatorId)
  }

  protected getSubject(context: CommentAddedContext): string {
    return `${context.comment.user.unwrap().fullName} added a comment`
  }

  protected getTemplateInput(
    context: CommentAddedContext,
    receiver?: User,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.commentAdded] {
    return {
      firstName: receiver?.firstName,
      content: {
        initiator: { fullName: context.comment.user.unwrap().fullName },
        comment: {
          body: context.comment.body,
          id: context.comment.id,
          contentObjectId: context.comment.contentObjectId,
          contentObjectType: context.comment.contentObjectType,
        },
        space: { id: context.spaceEvent.space.id },
        objectCommentsLink: context.objectCommentsLink,
      },
    }
  }
}
