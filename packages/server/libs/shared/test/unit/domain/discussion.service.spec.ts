import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db, generate } from '../../../src/test'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { Answer } from '@shared/domain/answer/answer.entity'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import AnswerRepository from '@shared/domain/answer/answer.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userContext: UserContext
  let discussionService: DiscussionService
  let entityLinkService: EntityLinkService
  let answerRepository: AnswerRepository
  let discussionRepository: DiscussionRepository

  const getEntityLinkStub = stub()
  const findOneStub = stub()
  const findEditableOneStub = stub()
  const findAccessibleOneStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userContext = create.contextHelper.create(user)
    await em.flush()
    answerRepository = {
      findAccessibleOne: findAccessibleOneStub,
    } as unknown as AnswerRepository

    entityLinkService = {} as unknown as EntityLinkService

    discussionRepository = {
      findOne: findOneStub,
      findEditableOne: findEditableOneStub,
      findAccessibleOne: findAccessibleOneStub,
    } as unknown as DiscussionRepository

    discussionService = new DiscussionService(
      em,
      userContext,
      discussionRepository,
      answerRepository,
      entityLinkService,
    )
    getEntityLinkStub.reset()
    findOneStub.reset()
    findEditableOneStub.reset()
    findAccessibleOneStub.reset()
  })

  it('create discussion in space', async () => {
    const space = await createBasicSpace()
    const scope = space.scope

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: space.scope,
      notify: [],
      attachments: null,
    }

    const result = await discussionService.createDiscussion(createDiscussionInput)

    const loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: result.id },
      { populate: ['note', 'answers', 'comments'] },
    )
    const note = loadedDiscussion.note.getEntity()
    expect(note.title).eq(createDiscussionInput.title)
    expect(note.content).eq(createDiscussionInput.content)
    expect(note.scope).eq(scope)
    expect(note.noteType).eq('Discussion')

    const follow = await em.findOneOrFail(DiscussionFollow, { followableId: loadedDiscussion.id })
    expect(follow.followableType).eq('Discussion')
    expect(follow.followerId).eq(user.id)
    expect(follow.followerType).eq('User')
    expect(follow.blocked).eq(false)
  })

  it('create discussion with public scope', async () => {
    const scope = STATIC_SCOPE.PUBLIC
    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const asset = create.filesHelper.createAsset(em, { user }, { name: 'asset-file', scope })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file', scope },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    const discussion = await discussionService.createDiscussion(createDiscussionInput)
    expect(discussion.scope).eq('public')
  })

  it('update public discussion', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user }, {})
    await em.flush()
    findEditableOneStub.resolves(discussion)

    let updateDiscussionInput: UpdateDiscussionDTO = {
      title: 'updated-title',
      content: 'updated-content',
      attachments: null,
    }

    await discussionService.updateDiscussion(discussion.id, updateDiscussionInput)

    let loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    let note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('public')
    expect(note.noteType).eq('Discussion')

    updateDiscussionInput = {
      title: 'updated-title',
      content: 'updated-content',
      attachments: null,
    }
    await discussionService.updateDiscussion(discussion.id, updateDiscussionInput)

    loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('public')
    expect(note.noteType).eq('Discussion')
  })

  it('create an answer in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })

    // const scope = space.scope
    // const attachments = await generateAttachments(scope)

    await em.flush()

    const createAnswerDTO: CreateAnswerDTO = {
      discussionId: discussion.id,
      title: 'answer',
      content: 'test-content',
      notify: [],
      attachments: null,
    }

    findAccessibleOneStub.resolves(discussion)
    const result = await discussionService.createAnswer(createAnswerDTO)

    const loadedAnswer = await em.findOneOrFail(Answer, { id: result.id }, { populate: ['note'] })
    const note = loadedAnswer.note.getEntity()
    expect(note.content).eq(createAnswerDTO.content)
    expect(note.noteType).eq('Answer')
    expect(note.scope).eq(space.scope)
  })

  it('create a discussion comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })

    findAccessibleOneStub.resolves(discussion)

    await em.flush()

    const createCommentDTO: CreateCommentDTO = {
      discussionId: discussion.id,
      content: 'test-content',
      notify: [],
    }

    const result = await discussionService.createComment(createCommentDTO)
    const loadedComment = await em.findOneOrFail(DiscussionComment, { id: result.id })
    expect(loadedComment.body).eq(createCommentDTO.content)
    expect(loadedComment.commentableType).eq('Discussion')
    expect(loadedComment.commentable.id).eq(discussion.id)
  })

  it('create an answer comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    const answer = create.discussionHelper.createAnswer(em, { user, discussion })
    await em.flush()
    findAccessibleOneStub.resolves(answer)

    const createCommentDTO: CreateCommentDTO = {
      answerId: answer.id,
      content: 'test-content',
      notify: [],
    }
    const result = await discussionService.createComment(createCommentDTO)

    const loadedComment = await em.findOneOrFail(AnswerComment, { id: result.id })
    expect(loadedComment.body).eq(createCommentDTO.content)
    expect(loadedComment.commentableType).eq('Answer')
    expect(loadedComment.commentable.id).eq(answer.id)
  })

  it('create a new follow for a discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()

    findAccessibleOneStub.resolves(discussion)

    await discussionService.followDiscussion(discussion.id)
    expect(await em.count(DiscussionFollow, { followableId: discussion.id })).eq(1)
  })

  it('remove a public discussion as author', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user })
    findEditableOneStub.resolves(discussion)
    await em.flush()

    findOneStub.resolves(discussion)

    await discussionService.deleteDiscussion(discussion.id)
    // not sure what except to put here.
  })

  it('remove a public discussion as site admin', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user })
    const adminUser = create.userHelper.createSiteAdmin(em)
    await em.flush()

    findEditableOneStub.resolves(discussion)

    const adminUserCtx = {
      user: adminUser,
      id: adminUser.id,
      dxuser: adminUser.dxuser,
      accessToken: 'foo',
      loadEntity: () => null,
    }

    discussionService = new DiscussionService(
      em,
      adminUserCtx,
      discussionRepository,
      answerRepository,
      entityLinkService,
    )

    await discussionService.deleteDiscussion(discussion.id)
    expect(await em.count(Discussion, { id: discussion.id })).eq(0)
  })
  it('fail removing a public discussion as non-author', async () => {
    const differentUser = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: differentUser })
    await em.flush()

    findOneStub.resolves(discussion)

    try {
      await discussionService.deleteDiscussion(discussion.id)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq(
        `Unable to delete discussion: not found or insufficient permissions.`,
      )
    }
  })
  it('remove a space discussion as author', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()
    findEditableOneStub.resolves(discussion)

    await discussionService.deleteDiscussion(discussion.id)
    expect(await em.count(Discussion, { id: discussion.id })).eq(0)
  })

  async function createBasicSpace() {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    create.spacesHelper.addMember(em, { user, space })
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    await em.flush()
    return space
  }
})
