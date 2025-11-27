import { EntityManager, MySqlDriver, Reference } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Answer } from '@shared/domain/answer/answer.entity'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { DiscussionReplyComment } from '@shared/domain/discussion-reply/discussion-reply-comment.entity'
import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DiscussionReplyRepository } from '@shared/domain/discussion-reply/discussion-reply.repository'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateReplyDTO } from '@shared/domain/discussion/dto/create-reply.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { UpdateReplyDTO } from '@shared/domain/discussion/dto/update-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { Note } from '@shared/domain/note/note.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError, ValidationError } from '@shared/errors'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db, generate } from '../../../src/test'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userContext: UserContext
  let discussionService: DiscussionService
  let entityLinkService: EntityLinkService
  let discussionReplyRepository: DiscussionReplyRepository
  let discussionRepository: DiscussionRepository

  const findOneStub = stub()
  const findEditableOneStub = stub()
  const findAccessibleOneStub = stub()
  const discussionReplyFindOneStub = stub()
  const discussionReplyFindAccessibleOneStub = stub()
  const discussionReplyFindEditableOneStub = stub()

  beforeEach(async () => {
    // TODO PFDA-5997 - part 1: use only stubs and remove the database
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userContext = create.contextHelper.create(user)
    await em.flush()
    discussionReplyRepository = {
      findOne: discussionReplyFindOneStub,
      findEditableOne: discussionReplyFindEditableOneStub,
      findAccessibleOne: discussionReplyFindAccessibleOneStub,
    } as unknown as DiscussionReplyRepository

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
      discussionReplyRepository,
      entityLinkService,
    )

    findOneStub.reset()
    findEditableOneStub.reset()
    findAccessibleOneStub.reset()
    discussionReplyFindOneStub.reset()
    discussionReplyFindAccessibleOneStub.reset()
    discussionReplyFindEditableOneStub.reset()
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
      { populate: ['note'] },
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

    const createReplyDTO: CreateReplyDTO = {
      title: 'answer',
      content: 'test-content',
      notify: [],
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    }

    findAccessibleOneStub.resolves(discussion)
    const result = await discussionService.createReply(discussion.id, createReplyDTO)

    const loadedAnswer = await em.findOneOrFail(Answer, { id: result.id }, { populate: ['note'] })
    const note = loadedAnswer.note.getEntity()
    expect(note.content).eq(createReplyDTO.content)
    expect(note.noteType).eq('Answer')
    expect(note.scope).eq(space.scope)
  })

  it('create 2nd answer in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()

    const createReplyDTO: CreateReplyDTO = {
      title: 'answer',
      content: 'test-content',
      notify: [],
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    }

    findAccessibleOneStub.resolves(discussion)
    await discussionService.createReply(discussion.id, createReplyDTO)
    try {
      await discussionService.createReply(discussion.id, createReplyDTO)
    } catch (error) {
      expect(error.name).to.equal('ValidationError')
      expect(error.message).to.equal(
        'Unable to create reply: user already has an answer for this discussion.',
      )
    }
  })

  it('create a discussion comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })

    findAccessibleOneStub.resolves(discussion)

    await em.flush()

    const createReplyDTO: CreateReplyDTO = {
      title: 'comment',
      content: 'test-content',
      notify: [],
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.COMMENT,
    }

    const result = await discussionService.createReply(discussion.id, createReplyDTO)
    const loadedComment = await em.findOneOrFail(DiscussionComment, { id: result.id })
    expect(loadedComment.body).eq(createReplyDTO.content)
    expect(loadedComment.commentableType).eq('Discussion')
    expect(loadedComment.commentable.id).eq(discussion.id)
  })

  it('create an answer comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    const answer = create.discussionHelper.createAnswer(em, {
      user,
      discussion,
      scope: `space-${space.id}`,
    })
    await em.flush()
    findAccessibleOneStub.resolves(discussion)
    discussionReplyFindAccessibleOneStub.resolves(answer)

    const createReplyDTO: CreateReplyDTO = {
      title: 'comment',
      content: 'test-content',
      notify: [],
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.COMMENT,
      parentId: answer.id,
    }
    const result = await discussionService.createReply(discussion.id, createReplyDTO)

    const loadedComment = await em.findOneOrFail(
      DiscussionReplyComment,
      { id: result.id },
      {
        populate: ['note'],
      },
    )
    expect(loadedComment.note.getEntity().content).eq(createReplyDTO.content)
    expect(loadedComment.parent.id).eq(answer.id)
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
      loadEntity: (): null => null,
    }

    discussionService = new DiscussionService(
      em,
      adminUserCtx,
      discussionRepository,
      discussionReplyRepository,
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

  context('createReply', () => {
    it('fail to create a reply if discussion does not exist', async () => {
      const discussionId = 1
      const createReplyDTO: CreateReplyDTO = {
        title: 'reply',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }

      await expect(discussionService.createReply(discussionId, createReplyDTO)).to.be.rejectedWith(
        NotFoundError,
        'Unable to create reply: discussion not found or inaccessible.',
      )
    })

    it('fail to create a reply if discussion is not accessible', async () => {
      const discussion = create.discussionHelper.create(em, { user })
      await em.flush()

      findAccessibleOneStub.resolves(discussion)

      const createReplyDTO: CreateReplyDTO = {
        title: 'reply',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }
      try {
        await discussionService.createReply(discussion.id, createReplyDTO)
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq('Unable to create reply: unpublished discussion.')
      }
    })

    it('create an answer in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })

      // const scope = space.scope
      // const attachments = await generateAttachments(scope)

      await em.flush()

      const createReplyDTO: CreateReplyDTO = {
        title: 'answer',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }

      findAccessibleOneStub.resolves(discussion)
      const result = await discussionService.createReply(discussion.id, createReplyDTO)

      const loadedAnswer = await em.findOneOrFail(Answer, { id: result.id }, { populate: ['note'] })
      const note = loadedAnswer.note.getEntity()
      expect(note.content).eq(createReplyDTO.content)
      expect(note.noteType).eq('Answer')
      expect(note.scope).eq(space.scope)
    })

    it('create 2nd answer in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const answer = create.discussionHelper.createAnswer(em, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()

      const createReplyDTO: CreateReplyDTO = {
        title: 'answer',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }

      findAccessibleOneStub.resolves(discussion)
      discussionReplyFindOneStub.resolves(answer)

      await expect(discussionService.createReply(discussion.id, createReplyDTO)).to.be.rejectedWith(
        ValidationError,
        'Unable to create reply: user already has an answer for this discussion.',
      )
    })

    it('create a discussion comment in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })

      findAccessibleOneStub.resolves(discussion)

      await em.flush()

      const createReplyDTO: CreateReplyDTO = {
        title: 'comment',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      }

      const result = await discussionService.createReply(discussion.id, createReplyDTO)

      const loadedComment = await em.findOneOrFail(
        DiscussionReply,
        { id: result.id },
        { populate: ['note'] },
      )
      expect(loadedComment.discussion.id).eq(discussion.id)
      expect(loadedComment.replyType).eq(DISCUSSION_REPLY_TYPE.COMMENT)
      expect(loadedComment.note.getEntity().content).eq(createReplyDTO.content)
      expect(loadedComment.note.getEntity().noteType).eq('Comment')
      expect(loadedComment.note.getEntity().scope).eq(space.scope)

      const loadedOldComment = await em.findOneOrFail(DiscussionComment, {
        id: loadedComment.oldComment.id,
      })
      expect(loadedOldComment.body).eq(createReplyDTO.content)
      expect(loadedOldComment.commentableType).eq('Discussion')
      expect(loadedOldComment.commentable.id).eq(discussion.id)
    })

    it('fail to create a comment in a discussion without parent', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      await em.flush()

      findAccessibleOneStub.resolves(discussion)
      const createReplyDTO: CreateReplyDTO = {
        title: 'comment',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
        parentId: 100,
      }
      await expect(discussionService.createReply(discussion.id, createReplyDTO)).to.be.rejectedWith(
        NotFoundError,
        `Unable to create reply: parent reply (id:${createReplyDTO.parentId}) not found or inaccessible.`,
      )
    })

    it('create an answer comment in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const answer = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.ANSWER, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()
      findAccessibleOneStub.resolves(discussion)
      discussionReplyFindAccessibleOneStub.resolves(answer)

      const createReplyDTO: CreateReplyDTO = {
        title: 'comment',
        content: 'test-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
        parentId: answer.id,
      }
      const result = await discussionService.createReply(discussion.id, createReplyDTO)

      const loadedComment = await em.findOneOrFail(
        DiscussionReply,
        { id: result.id },
        { populate: ['note'] },
      )
      expect(loadedComment.discussion.id).eq(discussion.id)
      expect(loadedComment.replyType).eq(DISCUSSION_REPLY_TYPE.COMMENT)
      expect(loadedComment.parent.id).eq(answer.id)
      expect(loadedComment.note.getEntity().content).eq(createReplyDTO.content)
      expect(loadedComment.note.getEntity().noteType).eq('Comment')
      expect(loadedComment.note.getEntity().scope).eq(space.scope)

      const loadedOldComment = await em.findOneOrFail(AnswerComment, {
        id: loadedComment.oldComment.id,
      })
      expect(loadedOldComment.body).eq(createReplyDTO.content)
      expect(loadedOldComment.commentableType).eq('Answer')
      expect(loadedOldComment.commentable.id).eq(answer.id)
    })
  })

  context('updateReply', () => {
    it('fail to update a reply if it does not exist', async () => {
      const replyId = 1
      const updateReplyDTO: CreateReplyDTO = {
        title: 'updated-title',
        content: 'updated-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }
      await expect(discussionService.updateReply(replyId, updateReplyDTO)).to.be.rejectedWith(
        NotFoundError,
        'Unable to update reply: not found or insufficient permissions.',
      )
    })

    it('update an answer content in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, {
        user,
        space,
      })
      const answer = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.ANSWER, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()

      discussionReplyFindEditableOneStub.resolves(answer)

      const updateReplyDTO: UpdateReplyDTO = {
        content: 'updated-content',
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      }

      await discussionService.updateReply(answer.id, updateReplyDTO)

      const loadedAnswer = await em.findOneOrFail(Answer, { id: answer.id }, { populate: ['note'] })
      expect(loadedAnswer.note.getEntity().content).eq(updateReplyDTO.content)
    })

    it('update a comment in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const comment = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.COMMENT, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()

      // PFDA-5997 - part 1: remove this after deprecating `comment` table
      const oldComment = new DiscussionComment(user)
      oldComment.body = comment.note.getEntity().content
      oldComment.commentableType = 'Discussion'
      oldComment.commentable = Reference.create(discussion)
      await em.persistAndFlush(oldComment)
      comment.oldComment = Reference.create(oldComment)

      discussionReplyFindEditableOneStub.resolves(comment)

      const updateReplyDTO: CreateReplyDTO = {
        title: 'updated-comment',
        content: 'updated-content',
        notify: [],
        attachments: null,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      }

      const result = await discussionService.updateReply(comment.id, updateReplyDTO)

      const loadedComment = await em.findOneOrFail(
        DiscussionReply,
        { id: result.id },
        { populate: ['note'] },
      )
      expect(loadedComment.note.getEntity().content).eq(updateReplyDTO.content)
      const loadedOldComment = await em.findOneOrFail(DiscussionComment, {
        id: loadedComment.oldComment.id,
      })
      expect(loadedOldComment.body).eq(updateReplyDTO.content)
    })
  })

  context('deleteReply', () => {
    it('fail to delete a reply if it does not exist', async () => {
      const replyId = 1
      await expect(discussionService.deleteReply(replyId)).to.be.rejectedWith(
        NotFoundError,
        'Unable to delete reply: not found or insufficient permissions.',
      )

      await expect(discussionService.deleteReply(replyId)).to.be.rejectedWith(
        NotFoundError,
        'Unable to delete reply: not found or insufficient permissions.',
      )
    })

    it('delete an answer in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const answer = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.ANSWER, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()

      discussionReplyFindEditableOneStub.resolves(answer)

      await discussionService.deleteReply(answer.id)
      expect(await em.count(Answer, { id: answer.id })).eq(0)
    })

    it('delete a comment in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const comment = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.COMMENT, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      await em.flush()

      // PFDA-5997 - part 1: remove this after deprecating `comment` table
      const oldComment = new DiscussionComment(user)
      oldComment.body = comment.note.getEntity().content
      oldComment.commentable = Reference.create(discussion)
      await em.persistAndFlush(oldComment)
      comment.oldComment = Reference.create(oldComment)
      await em.populate(comment, ['note', 'oldComment'])

      discussionReplyFindEditableOneStub.resolves(comment)

      await discussionService.deleteReply(comment.id)

      expect(discussionReplyFindEditableOneStub.calledOnce).to.be.true()
      expect(await em.count(DiscussionReply, { id: comment.id })).eq(0)
      expect(await em.count(Note, { id: comment.note.getEntity().id })).eq(0)
      expect(await em.count(DiscussionComment, { id: oldComment.id })).eq(0)
    })

    it('delete an answer and its comment in a space discussion', async () => {
      const space = await createBasicSpace()
      const discussion = create.discussionHelper.createInSpace(em, { user, space })
      const answer = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.ANSWER, {
        user,
        discussion,
        scope: `space-${space.id}`,
      })
      const comment = create.discussionHelper.createReply(em, DISCUSSION_REPLY_TYPE.COMMENT, {
        user,
        discussion,
        scope: `space-${space.id}`,
        parent: answer,
      })
      await em.flush()

      // PFDA-5997 - part 1: remove this after deprecating `comment` table
      const oldComment = new AnswerComment(user)
      oldComment.body = comment.note.getEntity().content
      oldComment.commentable = Reference.create(answer)
      await em.persistAndFlush(oldComment)
      comment.oldComment = Reference.create(oldComment)

      const populatedAnswer = await em.findOneOrFail(
        DiscussionReply,
        { id: answer.id },
        {
          populate: ['note', 'note.attachments'],
        },
      )

      await em.populate(populatedAnswer, [
        'comments',
        'comments.note',
        'comments.note.attachments',
        'comments.oldComment',
      ])

      discussionReplyFindEditableOneStub.resolves(populatedAnswer)
      await discussionService.deleteReply(answer.id)
      expect(await em.count(DiscussionReply, { id: answer.id })).eq(0)
      expect(await em.count(DiscussionReply, { parent: answer.id })).eq(0)
      expect(await em.count(Note, { id: { $in: [answer.note.id, comment.note.id] } })).eq(0)
      expect(
        await em.count(Attachment, { note: { id: { $in: [answer.note.id, comment.note.id] } } }),
      ).eq(0)
      expect(await em.count(DiscussionComment, { id: oldComment.id })).eq(0)
    })
  })

  it('create a new follow for a discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()

    findAccessibleOneStub.resolves(discussion)

    await discussionService.followDiscussion(discussion.id)
    expect(await em.count(DiscussionFollow, { followableId: discussion.id })).eq(1)
  })

  async function createBasicSpace(): Promise<Space> {
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
