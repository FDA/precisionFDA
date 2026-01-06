import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EntityService } from '@shared/domain/entity/entity.service'
import { EmailClient } from '@shared/services/email-client'
import { NewDiscussionReplyHandler } from '@shared/domain/email/templates/handlers/new-discussion-reply.handler'
import { stub } from 'sinon'
import { expect } from 'chai'
import { DiscussionNotificationDTO } from '@shared/domain/email/dto/discussion-notification.dto'
import { Organization } from '@shared/domain/org/organization.entity'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Collection, Reference } from '@mikro-orm/core'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'

describe('NewDiscussionReplyHandler', () => {
  const discussionRepoFindOneStub = stub()
  const entityServiceGetEntityUiLinkStub = stub()
  const spaceRepoFindOneStub = stub()
  const spaceMembershipRepoFindStub = stub()
  const userRepoFindStub = stub()
  const emailClientSendEmailStub = stub()

  const discussionRepo = {
    findOne: discussionRepoFindOneStub,
  } as unknown as DiscussionRepository
  const spaceRepo = {
    findOne: spaceRepoFindOneStub,
  } as unknown as SpaceRepository
  const userRepo = {
    find: userRepoFindStub,
  } as unknown as UserRepository
  const spaceMembershipRepo = {
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const entityService = {
    getEntityUiLink: entityServiceGetEntityUiLinkStub,
  } as unknown as EntityService
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  describe('#sendEmail', () => {
    beforeEach(() => {
      discussionRepoFindOneStub.reset()
      discussionRepoFindOneStub.throws()

      entityServiceGetEntityUiLinkStub.reset()
      entityServiceGetEntityUiLinkStub.throws()

      spaceRepoFindOneStub.reset()
      spaceRepoFindOneStub.throws()

      spaceMembershipRepoFindStub.reset()
      spaceMembershipRepoFindStub.throws()

      userRepoFindStub.reset()
      userRepoFindStub.throws()

      emailClientSendEmailStub.reset()
      emailClientSendEmailStub.throws()
    })

    const getNewDiscussionReplyHandler = (): NewDiscussionReplyHandler => {
      return new NewDiscussionReplyHandler(
        discussionRepo,
        spaceRepo,
        userRepo,
        spaceMembershipRepo,
        entityService,
        emailClient,
      )
    }

    it('all', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'frcaldo.serpentini@gmail.com'
      const user2 = new User(org)
      user2.email = 'susi.pradlo@gmail.com'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1
      discussion.follows = new Collection<DiscussionFollow>(discussion)

      const spaceMembership = new SpaceMembership(
        user2,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )

      discussionRepoFindOneStub
        .withArgs(discussion.id, {
          populate: ['note', 'user', 'follows'],
        })
        .resolves(discussion)
      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)
      spaceMembershipRepoFindStub
        .withArgs({ spaces: space.id, active: true }, { populate: ['user'] })
        .resolves([spaceMembership])

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = 'all'

      const newDiscussionHandler = getNewDiscussionReplyHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newDiscussionReply,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user2.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion reply notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
    })

    it('author', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'frcaldo.serpentini@gmail.com'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1
      discussion.follows = new Collection<DiscussionFollow>(discussion)

      discussionRepoFindOneStub
        .withArgs(discussion.id, {
          populate: ['note', 'user', 'follows'],
        })
        .resolves(discussion)
      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = 'author'

      const newDiscussionHandler = getNewDiscussionReplyHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newDiscussionReply,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion reply notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
    })

    it('specific users and followers', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'frcaldo.serpentini@gmail.com'
      const user2 = new User(org)
      user2.email = 'nastvan.kulemahazi@gmail.com'
      user2.dxuser = 'nkulemahazi'
      const follower = new User(org)
      follower.id = 3
      follower.email = 'maho.jakobic@gmail.com'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1
      discussion.follows = new Collection<DiscussionFollow>(discussion)
      const discussionFollows = new DiscussionFollow(discussion)
      discussionFollows.followableId = Reference.create(discussion)
      discussionFollows.followerType = 'User'
      discussionFollows.followerId = follower.id
      discussion.follows.add(discussionFollows)

      discussionRepoFindOneStub
        .withArgs(discussion.id, {
          populate: ['note', 'user', 'follows'],
        })
        .resolves(discussion)
      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      userRepoFindStub
        .withArgs({
          id: { $in: [follower.id] },
          userState: USER_STATE.ENABLED,
        })
        .resolves([follower])
      userRepoFindStub
        .withArgs({
          dxuser: { $in: [user2.dxuser] },
          spaceMemberships: { spaces: space.id, active: true },
        })
        .resolves([user2])
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = [user2.dxuser]

      const newDiscussionHandler = getNewDiscussionReplyHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledTwice).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newDiscussionReply,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(follower.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion reply notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
      expect(emailClientSendEmailStub.secondCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newDiscussionReply,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].to).to.eq(user2.email)
      expect(emailClientSendEmailStub.secondCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion reply notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].body).to.contain(
        '<a href="link_to_entity"',
      )
    })

    it('public discussion', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'frcaldo.serpentini@gmail.com'
      const follower = new User(org)
      follower.id = 3
      follower.email = 'maho.jakobic@gmail.com'
      const note = new Note(user)
      note.scope = 'public'
      const discussion = new Discussion(note, user)
      discussion.id = 1
      discussion.follows = new Collection<DiscussionFollow>(discussion)
      const discussionFollows = new DiscussionFollow(discussion)
      discussionFollows.followableId = Reference.create(discussion)
      discussionFollows.followerType = 'User'
      discussionFollows.followerId = follower.id
      discussion.follows.add(discussionFollows)

      discussionRepoFindOneStub
        .withArgs(discussion.id, {
          populate: ['note', 'user', 'follows'],
        })
        .resolves(discussion)
      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      userRepoFindStub
        .withArgs({
          id: { $in: [follower.id] },
          userState: USER_STATE.ENABLED,
        })
        .resolves([follower])

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = 'author'

      const newDiscussionHandler = getNewDiscussionReplyHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newDiscussionReply,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(follower.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        '[precisionFDA] New Public Discussion notification',
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
    })
  })
})
