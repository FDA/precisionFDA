import { OrderDefinition, Reference, Transactional } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { ObjectFilterQuery } from '@shared/database/domain/object-filter-query'
import { Answer } from '@shared/domain/answer/answer.entity'
import AnswerRepository from '@shared/domain/answer/answer.repository'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DiscussionReplyRepository } from '@shared/domain/discussion-reply/discussion-reply.repository'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { Vote } from '@shared/domain/vote/vote.entity'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import * as errors from '../../../errors'
import { Comment } from '../../comment/comment.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { getIdFromScopeName } from '../../space/space.helper'
import { CreateReplyDTO } from '../dto/create-reply.dto'
import { DiscussionReplyDTO } from '../dto/discussion-reply.dto'
import { UpdateReplyDTO } from '../dto/update-reply.dto'

@Injectable()
export class DiscussionService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly discussionRepository: DiscussionRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly discussionReplyRepository: DiscussionReplyRepository,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  async getDiscussion(discussionId: number): Promise<DiscussionDTO> {
    this.logger.log(`Getting discussion id: ${discussionId}`)

    const discussion = await this.discussionRepository.findAccessibleOne(
      { id: discussionId },
      {
        populate: [
          'note',
          'user',
          'answers',
          'answers.note',
          'answers.user',
          'answers.comments',
          'answers.comments.user',
          'comments',
          'comments.user',
          'follows',
        ],
      },
    )

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to get discussion: not found or insufficient permissions.',
      )
    }

    const follows =
      (await this.em.count(DiscussionFollow, {
        followableId: discussionId,
        followerId: this.userCtx.id,
        followerType: 'User',
      })) == 1

    // TODO Jiri - https://jira.internal.dnanexus.com/browse/PFDA-6053
    return DiscussionDTO.fromEntity(discussion, follows)
  }

  /**
   * Creates discussion and related note and persists them in a database. Returns error when an error occurs.
   * @param dto
   */
  @Transactional()
  async createDiscussion(dto: CreateDiscussionDTO): Promise<DiscussionDTO> {
    this.logger.log(`Creating discussion: ${JSON.stringify(dto)}`)

    const user = await this.userCtx.loadEntity()

    const newNote = new Note(user)
    newNote.title = dto.title
    newNote.content = dto.content
    newNote.noteType = 'Discussion'
    newNote.scope = dto.scope
    this.em.persist(newNote)

    const newDiscussion = new Discussion(newNote, user)
    await this.em.persistAndFlush(newDiscussion)

    const newFollow = new DiscussionFollow(newDiscussion)
    newFollow.followerId = user.id
    newFollow.followerType = 'User'
    newFollow.blocked = false
    this.em.persist(newFollow)

    return DiscussionDTO.fromEntity(newDiscussion, true)
  }

  @Transactional()
  async updateDiscussion(id: number, discussionInput: UpdateDiscussionDTO): Promise<DiscussionDTO> {
    this.logger.log(`Updating discussion: ${JSON.stringify(discussionInput)}`)

    const discussion = await this.discussionRepository.findEditableOne(
      { id },
      { populate: ['note'] },
    )

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to update discussion: not found or insufficient permissions.',
      )
    }
    const note = discussion.note.getEntity()
    if (discussionInput.title) {
      note.title = discussionInput.title
    }
    if (discussionInput.content) {
      note.content = discussionInput.content
    }
    await this.em.persistAndFlush(note)
    return DiscussionDTO.fromEntity(discussion)
  }

  async deleteDiscussion(discussionId: number): Promise<void> {
    this.logger.log(`Deleting discussion: ${discussionId}`)

    const discussion = await this.discussionRepository.findEditableOne(
      { id: discussionId },
      {
        populate: [
          'note',
          'answers',
          'comments',
          'note.attachments',
          'answers.note',
          'answers.note.attachments',
        ],
      },
    )

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to delete discussion: not found or insufficient permissions.',
      )
    }

    await this.em.transactional(async () => {
      const discussionNote = discussion.note.getEntity()
      if (!discussionNote.isPublic() && discussion.user.id !== this.userCtx.id) {
        const space = await this.em.findOne(Space, {
          id: discussionNote.getSpaceId(),
          spaceMemberships: {
            user: this.userCtx.id,
            role: { $in: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD] },
          },
        })
        if (!space) {
          throw new errors.PermissionError('Unable to delete discussion: insufficient permissions.')
        }
      }

      const discussionVotes = await this.em.find(Vote, {
        votableId: discussionId,
        votableType: 'Discussion',
      })
      const noteVotes = await this.em.find(Vote, {
        votableId: discussionNote.id,
        votableType: 'Note',
      })
      const follows = await this.em.find(DiscussionFollow, {
        followableId: discussionId,
      })
      this.logger.log(
        `Deleting discussion votes with ids: ${discussionVotes.map((vote) => vote.id)}`,
      )
      this.em.remove(discussionVotes)
      this.logger.log(`Deleting note votes with ids: ${noteVotes.map((vote) => vote.id)}`)
      this.em.remove(noteVotes)
      this.logger.log(`Deleting follows with ids: ${follows.map((follow) => follow.id)}`)
      this.em.remove(follows)
      // removal of discussion triggers cascade removal of answers,comments and attachments.
      this.logger.log(`Deleting discussion with id: ${discussion.id}`)
      await this.em.removeAndFlush(discussion)
    })
  }

  async listDiscussions(query: DiscussionPaginationDTO): Promise<PaginatedResult<DiscussionDTO>> {
    const noteAnd: ObjectFilterQuery<Note>[] = []
    const { scope, sort } = query
    const { title } = query.filter ?? {}

    if (title) {
      noteAnd.push({ title: { $like: `%${title}%` } })
    }

    const sortCopy = { ...sort }
    const order: OrderDefinition<Discussion> = sortCopy
    if (sortCopy.title) {
      order.note = { title: sortCopy.title }
      delete sortCopy.title
    }

    query.sort = sortCopy

    this.logger.log(`Getting discussions with scope: ${scope}`)
    if (scope === HOME_SCOPE.EVERYBODY) {
      noteAnd.push({ scope: STATIC_SCOPE.PUBLIC })
    } else if (scope === HOME_SCOPE.SPACES) {
      const spaces = await this.em.find(Space, {
        spaceMemberships: {
          active: true,
          user: {
            id: this.userCtx.id,
          },
        },
      })

      const scopes = spaces.map((s) => s.scope)
      noteAnd.push({ scope: { $in: scopes } })
    } else {
      const spaceId = getIdFromScopeName(scope)
      const space = await this.em.findOne(Space, {
        id: spaceId,
        spaceMemberships: {
          user: this.userCtx.id,
          active: true,
        },
      })
      if (!space) {
        throw new errors.PermissionError(
          'Unable to get discussions in selected space: insufficient permissions.',
        )
      }

      noteAnd.push({ scope: scope })
    }

    const result = await this.discussionRepository.paginate(
      query,
      { note: { $and: noteAnd } },
      {
        populate: ['note', 'user'],
      },
    )

    const discussions = await Promise.all(
      result.data.map((discussion) => DiscussionDTO.fromEntity(discussion)),
    )

    return {
      data: discussions,
      meta: result.meta,
    }
  }

  async createReply(discussionId: number, dto: CreateReplyDTO): Promise<DiscussionReplyDTO> {
    this.logger.log(`Creating reply: ${JSON.stringify(dto)}`)
    const user = await this.userCtx.loadEntity()

    const discussion = await this.discussionRepository.findAccessibleOne(
      { id: discussionId },
      { populate: ['note'] },
    )

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to create reply: discussion not found or inaccessible.',
      )
    }
    const discussionNote = discussion.note.getEntity()
    if (discussionNote.scope === 'private') {
      throw new errors.PermissionError('Unable to create reply: unpublished discussion.')
    }

    // TODO PFDA-5997 - part 1: use DiscussionReplyRepository to find parent reply
    let parentReply: Answer | null = null
    if (dto.parentId) {
      parentReply = await this.answerRepository.findAccessibleOne(
        { id: dto.parentId, note: { scope: discussionNote.scope } },
        {
          populate: ['note'],
        },
      )

      if (!parentReply) {
        throw new errors.NotFoundError(
          `Unable to create reply: parent reply (id:${dto.parentId}) not found or inaccessible.`,
        )
      }
    }

    if (dto.type === DISCUSSION_REPLY_TYPE.ANSWER) {
      const existingAnswer = await this.answerRepository.findOne({
        discussion: discussionId,
        user: user.id,
      })
      if (existingAnswer) {
        throw new errors.ValidationError(
          'Unable to create reply: user already has an answer for this discussion.',
        )
      }
    }

    return await this.em.transactional(async () => {
      const newNote = new Note(user)
      newNote.title = dto.title
      newNote.content = dto.content
      newNote.scope = discussionNote.scope
      newNote.noteType = dto.type
      this.em.persist(newNote)
      const newReply = new DiscussionReply(newNote, discussion, user, parentReply)
      newReply.replyType = dto.type

      // TODO PFDA-5997 - part 1: remove this after deprecating `comments` table
      if (dto.type === DISCUSSION_REPLY_TYPE.COMMENT) {
        const oldComment = this.createComment(user, dto, discussion, parentReply)
        newReply.oldComment = Reference.create(oldComment)
      }

      await this.em.persistAndFlush(newReply)
      return DiscussionReplyDTO.fromEntity(newReply)
    })
  }

  async updateReply(replyId: number, input: UpdateReplyDTO): Promise<DiscussionReplyDTO> {
    let reply: DiscussionReply | null = null
    // TODO PFDA-5997 - part 1: query DiscussionReply only
    if (input.type === DISCUSSION_REPLY_TYPE.COMMENT) {
      reply = await this.discussionReplyRepository.findEditableOne(
        { oldComment: replyId },
        {
          populate: ['note', 'oldComment'],
        },
      )
    } else {
      reply = await this.discussionReplyRepository.findEditableOne(
        { id: replyId },
        {
          populate: ['note'],
        },
      )
    }

    if (!reply) {
      throw new errors.NotFoundError(
        'Unable to update reply: not found or insufficient permissions.',
      )
    }

    return await this.em.transactional(async () => {
      const note = reply.note.getEntity()
      if (input?.content) {
        note.content = input.content
      }
      await this.em.persistAndFlush(note)

      // TODO PFDA-5997 - part 1: remove this after deprecating `comments` table
      if (input.type === DISCUSSION_REPLY_TYPE.COMMENT) {
        reply.oldComment.getEntity().body = input.content
      }

      return DiscussionReplyDTO.fromEntity(reply)
    })
  }

  async deleteReply(replyId: number, type: DISCUSSION_REPLY_TYPE): Promise<void> {
    this.logger.log(`Deleting reply with id: ${replyId}`)

    // TODO PFDA-5997 - part 1: query DiscussionReply only and load comments if type is ANSWER
    let reply: Answer | DiscussionReply | null = null
    if (type === DISCUSSION_REPLY_TYPE.COMMENT) {
      reply = await this.discussionReplyRepository.findEditableOne(
        {
          oldComment: replyId,
        },
        {
          populate: ['note', 'note.attachments', 'oldComment'],
        },
      )
    } else {
      reply = await this.answerRepository.findEditableOne(
        {
          id: replyId,
        },
        {
          populate: [
            'note',
            'note.attachments',
            'comments',
            'newComments',
            'newComments.note',
            'newComments.note.attachments',
          ],
        },
      )
    }

    if (!reply) {
      throw new errors.NotFoundError(
        'Unable to delete reply: not found or insufficient permissions.',
      )
    }

    // TODO PFDA-5997 - part 1: cleanup answerVotes and noteVotes

    return this.em.removeAndFlush(reply)
  }

  private createComment(
    user: User,
    commentInput: CreateReplyDTO,
    discussion: Discussion,
    parentReply?: Answer,
  ): DiscussionComment | AnswerComment {
    this.logger.log(`Creating comment: ${JSON.stringify(commentInput)}`)

    let commentClass: typeof DiscussionComment | typeof AnswerComment = DiscussionComment
    let target: Discussion | Answer = discussion
    if (parentReply) {
      commentClass = AnswerComment
      target = parentReply
    }

    const newComment = new commentClass(user)
    newComment.body = commentInput.content
    newComment.commentable = Reference.create(target)
    // other params are intentionally null.
    return newComment
  }

  async getAnswer(answerId: number): Promise<AnswerDTO> {
    this.logger.log(`Getting answer with id: ${answerId}`)
    const res = await this.answerRepository.findAccessibleOne(
      {
        id: answerId,
      },
      {
        populate: ['note', 'user', 'comments', 'comments.user'],
      },
    )
    if (!res) {
      throw new errors.NotFoundError('Unable to get answer: not found or insufficient permissions.')
    }
    return AnswerDTO.fromEntity(res)
  }

  async getComment(commentId: number): Promise<CommentDTO> {
    this.logger.log(`Getting comment with id: ${commentId}`)
    const res = await this.em.findOne(Comment, { id: commentId })

    if (res.commentableType === 'Discussion') {
      const discussionComment = await this.em.findOne(DiscussionComment, { id: commentId })
      const targetDiscussion = await this.discussionRepository.findAccessibleOne(
        { id: discussionComment.commentable.id },
        { populate: ['note'] },
      )
      if (!targetDiscussion) {
        throw new errors.NotFoundError(
          'Unable to get discussion comment: not found or insufficient permissions.',
        )
      }
      return CommentDTO.fromEntity(discussionComment)
    }

    if (res.commentableType === 'Answer') {
      const answerComment = await this.em.findOne(AnswerComment, { id: commentId })
      const targetAnswer = await this.answerRepository.findAccessibleOne(
        { id: answerComment.commentable.id },
        { populate: ['note'] },
      )
      if (!targetAnswer) {
        throw new errors.NotFoundError(
          'Unable to get answer comment: not found or insufficient permissions.',
        )
      }
      return CommentDTO.fromEntity(answerComment)
    }
    throw new errors.NotFoundError('Unable to get comment.')
  }

  async followDiscussion(discussionId: number): Promise<void> {
    this.logger.log(`Adding new follower (user: ${this.userCtx.id}) to discussion: ${discussionId}`)
    const user = await this.userCtx.loadEntity()

    const discussion = await this.discussionRepository.findAccessibleOne({ id: discussionId })
    if (!discussion) {
      throw new errors.NotFoundError('Discussion not found or insufficient permissions.')
    }

    const follow = await this.em.findOne(DiscussionFollow, {
      followableId: discussionId,
      followerId: user.id,
    })

    if (!follow) {
      const newFollow = new DiscussionFollow(discussion)
      newFollow.followerId = user.id
      newFollow.followerType = 'User'
      newFollow.blocked = false
      await this.em.persistAndFlush(newFollow)
    }
  }

  async unfollowDiscussion(discussionId: number): Promise<void> {
    this.logger.log(`Removing follower (user: ${this.userCtx.id}) from discussion: ${discussionId}`)

    const user = await this.userCtx.loadEntity()

    const discussion = await this.discussionRepository.findAccessibleOne({ id: discussionId })
    if (!discussion) {
      throw new errors.NotFoundError('Discussion not found or insufficient permissions.')
    }

    const follow = await this.em.findOne(DiscussionFollow, {
      followableId: discussionId,
      followerId: user.id,
      followerType: 'User',
    })

    if (follow) {
      await this.em.removeAndFlush(follow)
    }
  }

  async getDiscussionUiLink(discussionId: number): Promise<string> {
    this.logger.log(
      `Generating UI-link to discussion: ${discussionId} for user: ${this.userCtx.id}`,
    )
    const discussion = await this.discussionRepository.findOne({ id: discussionId })
    return this.entityLinkService.getUiLink(discussion)
  }

  async getAnswerUiLink(answerId: number): Promise<string> {
    this.logger.log(`Generating UI-link to answer: ${answerId} for user: ${this.userCtx.id}`)
    const answer = await this.em.findOne(Answer, { id: answerId })
    // answer was returned as DiscussionReply, cast it to Answer
    return this.entityLinkService.getUiLink(Object.setPrototypeOf(answer, Answer.prototype))
  }

  async getCommentUiLink(commentId: number): Promise<string> {
    this.logger.log(`Generating UI-link to comment: ${commentId} for user: ${this.userCtx.id}`)
    const comment = await this.em.findOne(Comment, { id: commentId })
    return this.entityLinkService.getUiLink(comment)
  }
}
