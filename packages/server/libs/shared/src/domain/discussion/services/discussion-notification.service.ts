import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import {
  DiscussionEmailInput,
  newDiscussionTemplate,
} from '../../email/templates/mjml/new-discussion.template'
import { NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { newDiscussionReplyTemplate } from '@shared/domain/email/templates/mjml/new-discussion-reply.template'

@Injectable()
export class DiscussionNotificationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly discussionService: DiscussionService,
    private readonly emailQueueJobProducer: EmailQueueJobProducer,
    private readonly entityService: EntityService,
    private readonly spaceRepository: SpaceRepository,
    private readonly discussionRepository: DiscussionRepository,
  ) {}

  private async notifySpaceMembers(emailBody: string, subject: string, space: Space) {
    const spaceMemberships = await this.em.find(
      SpaceMembership,
      { spaces: space.id, active: true },
      { populate: ['user'] },
    )

    this.logger.log(
      `Sending discussion email notification to ${spaceMemberships.length} members of space (id: ${space.id})`,
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

  private async notifyUser(emailBody: string, subject: String, user: User) {
    this.logger.log(`Sending discussion email notification to user (id: ${user.id})`)

    const email = user.email
    const emailTask = {
      emailType: EMAIL_TYPES.spaceDiscussion,
      to: email,
      subject: subject,
      body: emailBody,
    } as EmailSendInput
    await this.emailQueueJobProducer.createSendEmailTask(emailTask, this.user)
  }

  async notifyNewDiscussion(discussionId: number, notify: NotifyType) {
    const discussion = await this.discussionRepository.findOne(discussionId, {
      populate: ['note', 'user'],
    })

    if (!discussion) {
      this.logger.log(`Discussion with id ${discussionId} not found, skipping notification`)
      return
    }

    const discussionLink = await this.entityService.getEntityUiLink(discussion)
    const note = discussion.note.getEntity()
    const scope = note.scope

    if (!EntityScopeUtils.isSpaceScope(scope)) {
      this.logger.log('New discussion is public, not in a space, skipping notification')
      return
    }

    const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
    const space = await this.spaceRepository.findOne(spaceId)

    const emailBody = buildEmailTemplate<DiscussionEmailInput>(newDiscussionTemplate, {
      url: discussionLink,
      spaceName: space.name,
    })

    const subject = `[precisionFDA] New Discussion notification: ${space.name}`

    if (notify === 'all') {
      return this.notifySpaceMembers(emailBody, subject, space)
    }

    if (notify === 'author') {
      return this.notifyUser(emailBody, subject, discussion.user.getEntity())
    }

    // Notify specific users selected by the author
    const emailTasks = notify.map(async (username) => {
      const user = await this.em.findOneOrFail(User, {
        dxuser: username,
        spaceMemberships: { spaces: space.id, active: true },
      })

      return this.notifyUser(emailBody, subject, user)
    })

    await Promise.all(emailTasks)
  }

  async notifyNewDiscussionReply(discussionId: number, notify: NotifyType) {
    const discussion = await this.discussionRepository.findOne(discussionId, {
      populate: ['note', 'user', 'follows'],
    })

    if (!discussion) {
      this.logger.log(`Discussion (id: ${discussionId}) not found, skipping notification`)
      return
    }

    let followers = await this.discussionService.getFollowers(discussionId)
    const note = discussion.note.getEntity()
    const discussionLink = await this.entityService.getEntityUiLink(discussion)

    let subject: string
    let emailBody: string

    if (EntityScopeUtils.isSpaceScope(note.scope)) {
      this.logger.log('Discussion is in space....')

      const spaceId = EntityScopeUtils.getSpaceIdFromScope(note.scope)
      const space = await this.spaceRepository.findOne(spaceId)

      subject = `[precisionFDA] New Discussion reply notification: ${space.name}`
      emailBody = buildEmailTemplate<DiscussionEmailInput>(newDiscussionReplyTemplate, {
        url: discussionLink,
        spaceName: space.name,
      })

      if (notify === 'all') {
        return this.notifySpaceMembers(emailBody, subject, space)
      }

      if (notify === 'author') {
        followers.push(discussion.user.getEntity())
      }

      if (Array.isArray(notify) && notify.length) {
        const users = await Promise.all(
          notify.map((username) =>
            this.em.findOneOrFail(User, {
              dxuser: username,
              spaceMemberships: { spaces: space.id, active: true },
            }),
          ),
        )
        followers.push(...users)
      }

      followers = Array.from(new Set(followers.map((user) => user.id))).map(
        (id) => followers.find((user) => user.id === id)!,
      )
    } else {
      this.logger.log('Discussion is public...')

      subject = `[precisionFDA] New Public Discussion notification`
      emailBody = buildEmailTemplate<DiscussionEmailInput>(newDiscussionReplyTemplate, {
        url: discussionLink,
        spaceName: null,
      })
    }

    await Promise.all(followers.map((follower) => this.notifyUser(emailBody, subject, follower)))
  }
}
