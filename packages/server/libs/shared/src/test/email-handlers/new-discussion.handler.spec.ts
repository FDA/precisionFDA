import { expect } from 'chai'
import { stub } from 'sinon'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionNotificationDTO } from '@shared/domain/email/dto/discussion-notification.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { NewDiscussionHandler } from '@shared/domain/email/templates/handlers/new-discussion.handler'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Note } from '@shared/domain/note/note.entity'
import { Organization } from '@shared/domain/org/organization.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'

describe('NewDiscussionHandler', () => {
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

  const getNewDiscussionHandler = (): NewDiscussionHandler => {
    return new NewDiscussionHandler(
      discussionRepo,
      spaceRepo,
      userRepo,
      spaceMembershipRepo,
      entityService,
      emailClient,
    )
  }

  describe('#sendEmail', () => {
    it('all', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'bangla.dezo@gmail.com'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1

      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )

      discussionRepoFindOneStub.withArgs(discussion.id, { populate: ['note', 'user'] }).resolves(discussion)

      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)
      spaceMembershipRepoFindStub
        .withArgs(
          {
            spaces: space.id,
            active: true,
          },
          { populate: ['user'] },
        )
        .resolves([spaceMembership])

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = 'all'

      const newDiscussionHandler = getNewDiscussionHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.newDiscussion)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
    })

    it('author', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'krum.pac@gmail.com'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1

      discussionRepoFindOneStub.withArgs(discussion.id, { populate: ['note', 'user'] }).resolves(discussion)

      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = 'author'

      const newDiscussionHandler = getNewDiscussionHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.newDiscussion)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
    })

    it('specific users', async () => {
      const entityLink = 'link_to_entity'
      emailClientSendEmailStub.reset()

      const org = new Organization()
      const user = new User(org)
      user.email = 'krum.pac@gmail.com'
      const user2 = new User(org)
      user2.email = 'miho.urvi@gmail.com'
      user2.dxuser = 'murvi'
      const user3 = new User(org)
      user3.email = 'sah.munato@gmail.com'
      user3.dxuser = 'smunato'
      const space = new Space()
      space.id = 2
      space.name = 'space-name'
      const note = new Note(user)
      note.scope = `space-${space.id}`
      const discussion = new Discussion(note, user)
      discussion.id = 1

      discussionRepoFindOneStub.withArgs(discussion.id, { populate: ['note', 'user'] }).resolves(discussion)

      entityServiceGetEntityUiLinkStub.withArgs(discussion).resolves(entityLink)
      spaceRepoFindOneStub.withArgs(space.id).resolves(space)
      userRepoFindStub
        .withArgs({
          dxuser: { $in: [user2.dxuser, user3.dxuser] },
          spaceMemberships: { spaces: space.id, active: true },
        })
        .resolves([user2, user3])

      const inputDto = new DiscussionNotificationDTO()
      inputDto.discussionId = discussion.id
      inputDto.notify = [user2.dxuser, user3.dxuser]

      const newDiscussionHandler = getNewDiscussionHandler()
      await newDiscussionHandler.sendEmail(inputDto)

      expect(emailClientSendEmailStub.calledTwice).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.newDiscussion)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user2.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('<a href="link_to_entity"')
      expect(emailClientSendEmailStub.secondCall.args[0].emailType).to.eq(EMAIL_TYPES.newDiscussion)
      expect(emailClientSendEmailStub.secondCall.args[0].to).to.eq(user3.email)
      expect(emailClientSendEmailStub.secondCall.args[0].subject).to.eq(
        `[precisionFDA] New Discussion notification: ${space.name}`,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].body).to.contain('<a href="link_to_entity"')
    })
  })
})
