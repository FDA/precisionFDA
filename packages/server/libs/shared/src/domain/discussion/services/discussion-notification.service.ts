import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import { EMAIL_TYPES, EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import {
  DiscussionEmailInput,
  spaceDiscussionTemplate,
} from '../../email/templates/mjml/space-discussion.template'
import { Discussion } from '../discussion.entity'

@Injectable()
export class DiscussionNotificationService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly emailQueueJobProducer: EmailQueueJobProducer,
    private readonly entityService: EntityService,
    private readonly userCtx: UserContext,
  ) {}

  private async notifySpaceMembers(space: Space, emailBody: string) {
    const spaceMemberships = await this.em.find(
      SpaceMembership,
      { spaces: space.id, active: true },
      { populate: ['user'] },
    )
    for (const member of spaceMemberships) {
      const email = member.user.getEntity().email
      const emailTask = {
        emailType: EMAIL_TYPES.spaceDiscussion,
        to: email,
        subject: `[precisionFDA] Discussion update notification: ${space.name}`,
        body: emailBody,
      } as EmailSendInput
      await this.emailQueueJobProducer.createSendEmailTask(emailTask, this.userCtx)
    }
  }

  async notifyDiscussion(space: Space, newDiscussion: Discussion) {
    const discussionLink = await this.entityService.getEntityUiLink(newDiscussion)
    const emailInput = {
      url: discussionLink,
      spaceName: space.name,
    } as DiscussionEmailInput
    const emailBody = buildEmailTemplate<DiscussionEmailInput>(spaceDiscussionTemplate, emailInput)
    await this.notifySpaceMembers(space, emailBody)
  }

  async notifyDiscussionAnswer(space: Space, newAnswer: Answer) {
    if (!newAnswer.discussion.isInitialized()) {
      await this.em.populate(newAnswer, ['discussion', 'discussion.note'])
    }
    const discusion = newAnswer.discussion.getEntity()
    const discussionLink = await this.entityService.getEntityUiLink(discusion)
    const emailInput = {
      url: discussionLink,
      spaceName: space.name,
    } as DiscussionEmailInput
    const emailBody = buildEmailTemplate<DiscussionEmailInput>(spaceDiscussionTemplate, emailInput)
    await this.notifySpaceMembers(space, emailBody)
  }

  async notifyDiscussionComment(space: Space, discussion: Discussion) {
    const discussionLink = await this.entityService.getEntityUiLink(discussion)
    const emailInput = {
      url: discussionLink,
      spaceName: space.name,
    } as DiscussionEmailInput
    const emailBody = buildEmailTemplate<DiscussionEmailInput>(spaceDiscussionTemplate, emailInput)

    await this.notifySpaceMembers(space, emailBody)
  }
}
