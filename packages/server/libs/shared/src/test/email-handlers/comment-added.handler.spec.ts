import { stub } from 'sinon'
import { EmailClient } from '@shared/services/email-client'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { CommentAddedEmailHandler } from '@shared/domain/email/templates/handlers/comment-added.handler'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'
import { CommentRepository } from '@shared/domain/comment/comment.repository'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { AppRepository } from '@shared/domain/app/app.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { expect } from 'chai'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { config } from '@shared/config'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

describe('CommentAddedEmailHandler', () => {
  const USER_ID = 7
  const EVENT_CREATOR_ID = 117
  const SPACE_ID = 8
  const SPACE_EVENT_ID = 15
  const COMMENT_ID = 16
  const NODE_ID = 17
  const APP_ID = 17
  const JOB_ID = 17

  const emailClientSendEmailStub = stub()
  const spaceEventRepoFindOneOrFailStub = stub()
  const commentRepoFindOneOrFailStub = stub()
  const userFileRepoFindOneOrFailStub = stub()
  const appRepoFindOneOrFailStub = stub()
  const jobRepoFindOneOrFailStub = stub()
  const spaceMembershipRepoFindStub = stub()

  const em = {} as unknown as SqlEntityManager
  const spaceEventRepo = {
    findOneOrFail: spaceEventRepoFindOneOrFailStub,
  } as unknown as SpaceEventRepository
  const commentRepository = {
    findOneOrFail: commentRepoFindOneOrFailStub,
  } as unknown as CommentRepository
  const userFileRepo = {
    findOneOrFail: userFileRepoFindOneOrFailStub,
  } as unknown as UserFileRepository
  const appRepo = {
    findOneOrFail: appRepoFindOneOrFailStub,
  } as unknown as AppRepository
  const jobRepo = {
    findOneOrFail: jobRepoFindOneOrFailStub,
  } as unknown as JobRepository
  const spaceMembershipRepo = {
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): CommentAddedEmailHandler => {
    return new CommentAddedEmailHandler(
      em,
      spaceEventRepo,
      commentRepository,
      userFileRepo,
      appRepo,
      jobRepo,
      spaceMembershipRepo,
      emailClient,
    )
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    spaceEventRepoFindOneOrFailStub.reset()
    spaceEventRepoFindOneOrFailStub.throws()

    commentRepoFindOneOrFailStub.reset()
    commentRepoFindOneOrFailStub.throws()

    userFileRepoFindOneOrFailStub.reset()
    userFileRepoFindOneOrFailStub.throws()

    appRepoFindOneOrFailStub.reset()
    appRepoFindOneOrFailStub.throws()

    jobRepoFindOneOrFailStub.reset()
    jobRepoFindOneOrFailStub.throws()

    spaceMembershipRepoFindStub.reset()
    spaceMembershipRepoFindStub.throws()
  })

  describe('#sendEmail', () => {
    it('comment type node', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Antonio'
      user.lastName = 'Seruti'
      user.email = 'antonio.seruti@gmail.com'
      const userCreator = new User(organization)
      userCreator.id = EVENT_CREATOR_ID
      const space = new Space()
      space.id = SPACE_ID
      const spaceEvent = new SpaceEvent(userCreator, space)
      spaceEvent.id = SPACE_EVENT_ID
      spaceEvent.entityId = COMMENT_ID
      const comment = new Comment(user)
      comment.id = COMMENT_ID
      comment.contentObjectType = 'Node'
      comment.contentObjectId = NODE_ID
      const userFile = new UserFile(user)
      userFile.uid = `file-${NODE_ID}-1`
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )

      spaceEventRepoFindOneOrFailStub
        .withArgs({ id: SPACE_EVENT_ID }, { populate: ['space'] })
        .resolves(spaceEvent)
      commentRepoFindOneOrFailStub
        .withArgs({ id: COMMENT_ID }, { populate: ['user'] })
        .resolves(comment)
      userFileRepoFindOneOrFailStub
        .withArgs({ id: NODE_ID }, { populate: ['user'] })
        .resolves(userFile)
      spaceMembershipRepoFindStub
        .withArgs({ spaces: SPACE_ID, active: true }, { populate: ['user.notificationPreference'] })
        .resolves([spaceMembership])

      emailClientSendEmailStub.reset()
      const input = new ObjectIdInputDTO()
      input.id = SPACE_EVENT_ID
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `${user.firstName} ${user.lastName} added a comment`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `User ${user.firstName} ${user.lastName} added a new`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `${config.api.railsHost}/files/${userFile.uid}/comments`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.commentAdded)
    })

    it('comment type app', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Antonio'
      user.lastName = 'Seruti'
      user.email = 'antonio.seruti@gmail.com'
      const userCreator = new User(organization)
      userCreator.id = EVENT_CREATOR_ID
      const space = new Space()
      space.id = SPACE_ID
      const spaceEvent = new SpaceEvent(userCreator, space)
      spaceEvent.id = SPACE_EVENT_ID
      spaceEvent.entityId = COMMENT_ID
      const comment = new Comment(user)
      comment.id = COMMENT_ID
      comment.contentObjectType = 'App'
      comment.contentObjectId = APP_ID
      const app = new App(user)
      app.uid = `app-${APP_ID}-1`
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )

      spaceEventRepoFindOneOrFailStub
        .withArgs({ id: SPACE_EVENT_ID }, { populate: ['space'] })
        .resolves(spaceEvent)
      commentRepoFindOneOrFailStub
        .withArgs({ id: COMMENT_ID }, { populate: ['user'] })
        .resolves(comment)
      appRepoFindOneOrFailStub.withArgs({ id: APP_ID }, { populate: ['user'] }).resolves(app)
      spaceMembershipRepoFindStub
        .withArgs({ spaces: SPACE_ID, active: true }, { populate: ['user.notificationPreference'] })
        .resolves([spaceMembership])

      emailClientSendEmailStub.reset()
      const input = new ObjectIdInputDTO()
      input.id = SPACE_EVENT_ID
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `${user.firstName} ${user.lastName} added a comment`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `User ${user.firstName} ${user.lastName} added a new`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `${config.api.railsHost}/apps/${app.uid}/comments`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.commentAdded)
    })

    it('comment type job', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Antonio'
      user.lastName = 'Seruti'
      user.email = 'antonio.seruti@gmail.com'
      const userCreator = new User(organization)
      userCreator.id = EVENT_CREATOR_ID
      const space = new Space()
      space.id = SPACE_ID
      const spaceEvent = new SpaceEvent(userCreator, space)
      spaceEvent.id = SPACE_EVENT_ID
      spaceEvent.entityId = COMMENT_ID
      const comment = new Comment(user)
      comment.id = COMMENT_ID
      comment.contentObjectType = 'Job'
      comment.contentObjectId = JOB_ID
      const job = new Job(user)
      job.uid = `job-${JOB_ID}-1`
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )

      spaceEventRepoFindOneOrFailStub
        .withArgs({ id: SPACE_EVENT_ID }, { populate: ['space'] })
        .resolves(spaceEvent)
      commentRepoFindOneOrFailStub
        .withArgs({ id: COMMENT_ID }, { populate: ['user'] })
        .resolves(comment)
      jobRepoFindOneOrFailStub.withArgs({ id: JOB_ID }, { populate: ['user'] }).resolves(job)
      spaceMembershipRepoFindStub
        .withArgs({ spaces: SPACE_ID, active: true }, { populate: ['user.notificationPreference'] })
        .resolves([spaceMembership])

      emailClientSendEmailStub.reset()
      const input = new ObjectIdInputDTO()
      input.id = SPACE_EVENT_ID
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `${user.firstName} ${user.lastName} added a comment`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `User ${user.firstName} ${user.lastName} added a new`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `${config.api.railsHost}/jobs/${job.uid}/comments`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.commentAdded)
    })
  })
})
