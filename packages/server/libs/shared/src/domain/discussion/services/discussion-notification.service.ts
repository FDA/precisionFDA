import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { EMAIL_TYPES, EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import {
  DiscussionEmailInput,
  spaceDiscussionTemplate,
} from '../../email/templates/mjml/space-discussion.template'
import { Discussion } from '../discussion.entity'

@Injectable()
export class DiscussionNotificationService {
  @ServiceLogger()
  private readonly logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly emailQueueJobProducer: EmailQueueJobProducer,
    private readonly entityService: EntityService,
    private readonly entityFetcherService: EntityFetcherService,
    private readonly user: UserContext,
    private readonly spaceRepository: SpaceRepository,
  ) {}

  private async notifySpaceMembers(emailBody: string, subject: string, space: Space) {
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
        subject: subject,
        body: emailBody,
      } as EmailSendInput
      await this.emailQueueJobProducer.createSendEmailTask(emailTask, this.user)
    }
  }

  private async notifyPoster(emailBody: string, subject: String, posterId: number) {
    const poster = await this.em.findOneOrFail(User, {
      id: posterId,
    })
    const email = poster.email
    const emailTask = {
      emailType: EMAIL_TYPES.spaceDiscussion,
      to: email,
      subject: subject,
      body: emailBody,
    } as EmailSendInput
    await this.emailQueueJobProducer.createSendEmailTask(emailTask, this.user)
  }

  async notifySpaceDiscussion(discussionId: number, notifyAll: boolean) {
    const discussion = await this.entityFetcherService.getEditableById(
      Discussion,
      discussionId,
      {},
      { populate: ['note'] },
    )
    if (!discussion) {
      this.logger.log('Discussion not found, skipping notification')
      return
    }

    const discussionLink = await this.entityService.getEntityUiLink(discussion)
    const note = discussion.note.getEntity()
    if (!note.isInSpace()) {
      this.logger.log('Discussion is not in a space, skipping notification')
      return
    }
    const space = await this.spaceRepository.findSpaceByScopeAndUser(note.scope, this.user.id)
    const emailInput = {
      url: discussionLink,
      spaceName: space.name,
    } as DiscussionEmailInput
    const emailBody = buildEmailTemplate<DiscussionEmailInput>(spaceDiscussionTemplate, emailInput)
    const subject = `[precisionFDA] Discussion update notification: ${space.name}`
    if (notifyAll) {
      await this.notifySpaceMembers(emailBody, subject, space)
    } else {
      await this.notifyPoster(emailBody, subject, discussion.user.id)
    }
  }
}
