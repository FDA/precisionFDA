import { EntityManager, MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionNotificationService } from '@shared/domain/discussion/services/discussion-notification.service'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Note } from '@shared/domain/note/note.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import { stub } from 'sinon'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'

describe('DiscussionNotificationService', () => {
  let em: SqlEntityManager
  let user1: User
  let user2: User
  let user3: User
  let space: Space
  let discussion: Discussion
  let discussionNote: Note

  const DISCUSSION_ID = 1
  const DISCUSSION_NOTE_ID = 2
  const DISCUSSION_NOTE_TITLE = 'title'
  const DISCUSSION_LINK = 'link'

  const createSendEmailTaskStub = stub()
  const getEntityUiLinkStub = stub()
  const findOneDiscussionStub = stub()
  const findOneSpaceStub = stub()
  const findSpaceByScopeAndUserStub = stub()
  const getFollowersStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    create.userHelper.createAdmin(em)
    user1 = create.userHelper.create(em, { email: 'user1@test.com' })
    user2 = create.userHelper.create(em, { email: 'user2@test.com' })
    user3 = create.userHelper.create(em, { email: 'user3@test.com' })
    space = create.spacesHelper.create(em, { type: SPACE_TYPE.GROUPS })
    await em.flush()

    create.spacesHelper.addMember(
      em,
      { user: user1, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user: user2, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    create.spacesHelper.addMember(
      em,
      { user: user3, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()
    discussionNote = {
      id: DISCUSSION_NOTE_ID,
      title: DISCUSSION_NOTE_TITLE,
      scope: `space-${space.id}`,
      isInSpace: () => true,
    } as unknown as Note
    discussion = {
      id: DISCUSSION_ID,
      user: {
        id: user1.id,
        getEntity: () => user1,
      },
      note: {
        getEntity: () => discussionNote,
        load: () => discussionNote,
      },
    } as unknown as Discussion
    getEntityUiLinkStub.withArgs(discussion).resolves(DISCUSSION_LINK)
    mocksReset()
    createSendEmailTaskStub.reset()
    findOneDiscussionStub.reset()
    findOneSpaceStub.reset()
    findSpaceByScopeAndUserStub.reset()
    getFollowersStub.reset()
    findOneDiscussionStub.resolves(discussion)
    findOneSpaceStub.resolves(space)
    getFollowersStub.resolves([user1, user3])
  })

  it('should not send email if discussion is not found', async () => {
    findOneDiscussionStub.resolves(undefined)

    await getInstance(user1).notifyNewDiscussion(discussion.id, 'all')
    expect(createSendEmailTaskStub.callCount).to.be.equal(0)
  })

  it('should not send email if discussion is not in a space', async () => {
    discussionNote.scope = STATIC_SCOPE.PRIVATE
    discussionNote.isInSpace = () => false

    await getInstance(user1).notifyNewDiscussion(discussion.id, 'all')
    expect(createSendEmailTaskStub.callCount).to.be.equal(0)
  })

  it('should send new discussion email to space members separately if notify is all', async () => {
    await getInstance(user1).notifyNewDiscussion(discussion.id, 'all')
    expect(createSendEmailTaskStub.callCount).to.be.equal(3)
    expect(createSendEmailTaskStub.args[0][0].to).to.be.equal(user1.email)
    expect(createSendEmailTaskStub.args[1][0].to).to.be.equal(user2.email)
    expect(createSendEmailTaskStub.args[2][0].to).to.be.equal(user3.email)
    expect(createSendEmailTaskStub.args[0][0].subject).to.be.equal(
      `[precisionFDA] New Discussion notification: ${space.name}`,
    )
  })

  it('should not send any email if notify is empty', async () => {
    await getInstance(user1).notifyNewDiscussion(discussion.id, [])
    expect(createSendEmailTaskStub.callCount).to.be.equal(0)
  })

  it('should send new discussion email if notify is author', async () => {
    await getInstance(user1).notifyNewDiscussion(discussion.id, 'author')
    expect(createSendEmailTaskStub.callCount).to.be.equal(1)
  })

  it('should send new discussion emails to selected members', async () => {
    await getInstance(user1).notifyNewDiscussion(discussion.id, [user2.dxuser, user3.dxuser])
    expect(createSendEmailTaskStub.callCount).to.be.equal(2)

    const recipients = createSendEmailTaskStub.args.map((call) => call[0].to)
    expect(recipients).to.have.deep.members([user2.email, user3.email])
  })

  it('should send new reply email to only followers separately if notify is null', async () => {
    await getInstance(user1).notifyNewDiscussionReply(discussion.id, null)
    expect(createSendEmailTaskStub.callCount).to.be.equal(2)
    expect(createSendEmailTaskStub.args[0][0].to).to.be.equal(user1.email)
    expect(createSendEmailTaskStub.args[1][0].to).to.be.equal(user3.email)
  })

  it('should send new reply email to only followers separately if notify is all', async () => {
    await getInstance(user1).notifyNewDiscussionReply(discussion.id, 'all')
    expect(createSendEmailTaskStub.callCount).to.be.equal(3)
    expect(createSendEmailTaskStub.args[0][0].to).to.be.equal(user1.email)
    expect(createSendEmailTaskStub.args[1][0].to).to.be.equal(user2.email)
    expect(createSendEmailTaskStub.args[2][0].to).to.be.equal(user3.email)
  })

  function getInstance(user: User) {
    const emailQueueJobProducer = {
      createSendEmailTask: createSendEmailTaskStub,
    } as unknown as EmailQueueJobProducer
    const entityService = {
      getEntityUiLink: getEntityUiLinkStub,
    } as unknown as EntityService

    const discussionService = {
      getFollowers: getFollowersStub,
    } as unknown as DiscussionService

    const userCtx = {
      id: user.id,
      dxuser: user.dxuser,
    } as unknown as UserContext
    const spaceRepository = {
      findOne: findOneSpaceStub,
    } as unknown as SpaceRepository

    const discussionRepository = {
      findOne: findOneDiscussionStub,
    } as unknown as DiscussionRepository

    return new DiscussionNotificationService(
      em,
      userCtx,
      discussionService,
      emailQueueJobProducer,
      entityService,
      spaceRepository,
      discussionRepository,
    )
  }
})
