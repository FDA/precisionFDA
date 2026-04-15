import { OrderDefinition, Transactional } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { ObjectFilterQuery } from '@shared/database/domain/object-filter-query'
import { Answer } from '@shared/domain/answer/answer.entity'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { DiscussionCountService } from '@shared/domain/discussion/services/discussion-count.service'
import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DiscussionReplyRepository } from '@shared/domain/discussion-reply/discussion-reply.repository'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { DiscussionReplyComment } from '@shared/domain/discussion-reply/discussion-reply-comment.entity'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import * as errors from '../../../errors'
import { getIdFromScopeName } from '../../space/space.helper'
import { CreateReplyDTO } from '../dto/create-reply.dto'
import { DiscussionReplyDTO } from '../dto/discussion-reply.dto'
import { SimpleDiscussionDTO } from '../dto/simple-discussion.dto'
import { UpdateReplyDTO } from '../dto/update-reply.dto'

@Injectable()
export class DiscussionService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly discussionRepository: DiscussionRepository,
    private readonly discussionReplyRepository: DiscussionReplyRepository,
    private readonly entityLinkService: EntityLinkService,
    private readonly discussionCountService: DiscussionCountService,
  ) {}

  /**
   * Count discussions based on the given scope filter context
   */
  async countByScope(context: ScopeFilterContext): Promise<number> {
    return this.discussionCountService.count(context)
  }

  async getDiscussion(discussionId: number): Promise<DiscussionDTO> {
    const discussion = await this.discussionRepository.findAccessibleOne({ id: discussionId })

    if (!discussion) {
      throw new errors.NotFoundError('Unable to get discussion: not found or insufficient permissions.')
    }

    await this.em.populate(discussion, ['note', 'user', 'follows', 'replies', 'replies.user', 'replies.note'], {
      orderBy: {
        replies: {
          id: 'ASC',
        },
      },
    })

    const isFollowing = discussion.follows
      .getItems()
      .some(follow => follow.followerId === this.userCtx.id && follow.followerType === 'User')

    return DiscussionDTO.fromEntity(discussion, isFollowing)
  }

  /**
   * Creates discussion and related note and persists them in a database. Returns error when an error occurs.
   * @param dto
   */
  @Transactional()
  async createDiscussion(dto: CreateDiscussionDTO): Promise<DiscussionDTO> {
    const user = await this.userCtx.loadEntity()

    const newNote = new Note(user)
    newNote.title = dto.title
    newNote.content = dto.content
    newNote.noteType = 'Discussion'
    newNote.scope = dto.scope
    this.em.persist(newNote)

    const newDiscussion = new Discussion(newNote, user)
    await this.em.persist(newDiscussion).flush()

    const newFollow = new DiscussionFollow(newDiscussion)
    newFollow.followerId = user.id
    newFollow.followerType = 'User'
    newFollow.blocked = false
    this.em.persist(newFollow)
    return DiscussionDTO.fromEntity(newDiscussion, true)
  }

  @Transactional()
  async updateDiscussion(id: number, discussionInput: UpdateDiscussionDTO): Promise<DiscussionDTO> {
    const discussion = await this.discussionRepository.findEditableOne({ id }, { populate: ['note', 'user'] })

    if (!discussion) {
      throw new errors.NotFoundError('Unable to update discussion: not found or insufficient permissions.')
    }
    const note = discussion.note.getEntity()
    if (discussionInput.title) {
      note.title = discussionInput.title
    }
    if (discussionInput.content) {
      note.content = discussionInput.content
    }
    await this.em.persist(note).flush()
    return DiscussionDTO.fromEntity(discussion)
  }

  async deleteDiscussion(discussionId: number): Promise<void> {
    this.logger.log(`Deleting discussion: ${discussionId}`)

    const discussion = await this.discussionRepository.findEditableOne(
      { id: discussionId },
      {
        populate: ['note', 'note.attachments', 'replies', 'replies.note', 'replies.note.attachments', 'follows'],
      },
    )

    if (!discussion) {
      throw new errors.NotFoundError('Unable to delete discussion: not found or insufficient permissions.')
    }

    await this.em.remove(discussion).flush()
  }

  async listDiscussions(query: DiscussionPaginationDTO): Promise<PaginatedResult<SimpleDiscussionDTO>> {
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
          user: this.userCtx.id,
        },
      })

      const scopes = spaces.map(s => s.scope)
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
        throw new errors.PermissionError('Unable to get discussions in selected space: insufficient permissions.')
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

    const discussionIds = result.data.map(d => d.id)
    const answerCount = await this.discussionReplyRepository.getCountByDiscussionIds(
      discussionIds,
      DISCUSSION_REPLY_TYPE.ANSWER,
    )
    const commentCount = await this.discussionReplyRepository.getCountByDiscussionIds(
      discussionIds,
      DISCUSSION_REPLY_TYPE.COMMENT,
    )
    const discussions = result.data.map(discussion =>
      SimpleDiscussionDTO.fromEntity(
        discussion,
        false,
        answerCount[discussion.id] ?? 0,
        commentCount[discussion.id] ?? 0,
      ),
    )

    return {
      data: discussions,
      meta: result.meta,
    }
  }

  async createReply(discussionId: number, dto: CreateReplyDTO): Promise<DiscussionReplyDTO> {
    const user = await this.userCtx.loadEntity()

    const discussion = await this.discussionRepository.findAccessibleOne({ id: discussionId }, { populate: ['note'] })

    if (!discussion) {
      throw new errors.NotFoundError('Unable to create reply: discussion not found or inaccessible.')
    }
    const discussionNote = discussion.note.getEntity()
    if (discussionNote.scope === 'private') {
      throw new errors.PermissionError('Unable to create reply: unpublished discussion.')
    }

    let parentReply: Answer | null = null
    if (dto.parentId) {
      parentReply = await this.discussionReplyRepository.findAccessibleOne({
        id: dto.parentId,
        note: { scope: discussionNote.scope },
        replyType: DISCUSSION_REPLY_TYPE.ANSWER,
      })

      if (!parentReply) {
        throw new errors.NotFoundError(
          `Unable to create reply: parent reply (id:${dto.parentId}) not found or inaccessible.`,
        )
      }
    }

    if (dto.type === DISCUSSION_REPLY_TYPE.ANSWER) {
      const existingAnswer = await this.discussionReplyRepository.findOne({
        discussion: discussionId,
        user: user.id,
        replyType: DISCUSSION_REPLY_TYPE.ANSWER,
      })
      if (existingAnswer) {
        throw new errors.ValidationError('Unable to create reply: user already has an answer for this discussion.')
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
      await this.em.persist(newReply).flush()
      return DiscussionReplyDTO.fromEntity(newReply)
    })
  }

  async updateReply(replyId: number, input: UpdateReplyDTO): Promise<DiscussionReplyDTO> {
    const reply = await this.discussionReplyRepository.findEditableOne(
      { id: replyId },
      {
        populate: ['note', 'user'],
      },
    )

    if (!reply) {
      throw new errors.NotFoundError('Unable to update reply: not found or insufficient permissions.')
    }

    const updatedReply = await this.em.transactional(async () => {
      const note = reply.note.getEntity()
      if (input?.content) {
        note.content = input.content
      }

      await this.em.persist(note).flush()
      await this.em.persist(reply).flush()

      return DiscussionReplyDTO.fromEntity(reply)
    })

    return updatedReply
  }

  async deleteReply(replyId: number): Promise<void> {
    const reply = await this.discussionReplyRepository.findEditableOne(
      {
        id: replyId,
      },
      {
        populate: ['note', 'note.attachments'],
      },
    )

    if (!reply) {
      throw new errors.NotFoundError('Unable to delete reply: not found or insufficient permissions.')
    }

    if (reply.replyType === DISCUSSION_REPLY_TYPE.ANSWER) {
      await this.em.populate(reply, ['comments', 'comments.note', 'comments.note.attachments'])
    }

    // TODO PFDA-5997 - part 1: cleanup answerVotes and noteVotes

    await this.em.remove(reply).flush()
  }

  async getDiscussionReply(replyId: number): Promise<DiscussionReplyDTO> {
    const reply = await this.discussionReplyRepository.findAccessibleOne({ id: replyId })
    if (!reply) {
      throw new errors.NotFoundError('Unable to get discussion reply: not found or insufficient permissions.')
    }
    await this.em.populate(reply, ['note', 'user'])
    return DiscussionReplyDTO.fromEntity(reply)
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
      await this.em.persist(newFollow).flush()
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
      await this.em.remove(follow).flush()
    }
  }

  async getDiscussionUiLink(discussionId: number): Promise<string> {
    this.logger.log(`Generating UI-link to discussion: ${discussionId} for user: ${this.userCtx.id}`)
    const discussion = await this.discussionRepository.findOne({ id: discussionId })
    return this.entityLinkService.getUiLink(discussion)
  }

  async getAnswerUiLink(answerId: number): Promise<string> {
    this.logger.log(`Generating UI-link to answer: ${answerId} for user: ${this.userCtx.id}`)
    const answer = await this.discussionReplyRepository.findOne({ id: answerId })
    // Cast DiscussionReply to Answer
    return this.entityLinkService.getUiLink(Object.setPrototypeOf(answer, Answer.prototype))
  }

  async getCommentUiLink(commentId: number): Promise<string> {
    this.logger.log(`Generating UI-link to comment: ${commentId} for user: ${this.userCtx.id}`)
    const comment = await this.discussionReplyRepository.findOne({ id: commentId })
    // Cast DiscussionReply to DiscussionReplyComment
    return this.entityLinkService.getUiLink(Object.setPrototypeOf(comment, DiscussionReplyComment.prototype))
  }
}
