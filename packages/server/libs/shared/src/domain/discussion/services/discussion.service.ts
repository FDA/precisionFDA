import { OrderDefinition, Reference, Transactional } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { Vote } from '@shared/domain/vote/vote.entity'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import * as errors from '../../../errors'
import { Comment, CommentableType } from '../../comment/comment.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { getIdFromScopeName } from '../../space/space.helper'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'
import { UpdateAnswerDTO } from '@shared/domain/discussion/dto/update-answer.dto'
import { UpdateCommentDTO } from '@shared/domain/discussion/dto/update-comment.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import AnswerRepository from '@shared/domain/answer/answer.repository'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'

@Injectable()
export class DiscussionService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly discussionRepository: DiscussionRepository,
    private readonly answerRepository: AnswerRepository,
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
    // const where: ObjectQuery<Discussion> = {}
    //todo PFDA-6051: Ludvik fix type
    const where = { note: { $and: [] } }
    const { scope, sort } = query
    const { title } = query.filter ?? {}

    if (title) {
      where.note.$and.push({ title: { $like: `%${title}%` } })
    }

    //TODO PFDA-6051: Ludvik fix everything below
    const sortCopy = { ...sort }
    const order: OrderDefinition<Discussion> = sortCopy
    if (sortCopy.title) {
      order.note = { title: sortCopy.title }
      delete sortCopy.title
    }

    query.sort = sortCopy

    this.logger.log(`Getting discussions with scope: ${scope}`)
    if (scope === HOME_SCOPE.EVERYBODY) {
      where.note.$and.push({ scope: STATIC_SCOPE.PUBLIC })
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
      where.note.$and.push({ scope: { $in: scopes } })
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

      where.note.$and.push({ scope: scope })
    }
    const result = await this.discussionRepository.paginate(query, where, {
      populate: ['note', 'user'],
    })

    const discussions = await Promise.all(
      result.data.map((discussion) => DiscussionDTO.fromEntity(discussion)),
    )

    return {
      data: discussions,
      meta: result.meta,
    }
  }

  async createAnswer(dto: CreateAnswerDTO): Promise<AnswerDTO> {
    this.logger.log(`Creating answer: ${JSON.stringify(dto)}`)
    const user = await this.userCtx.loadEntity()

    const discussion = await this.discussionRepository.findAccessibleOne(
      { id: dto.discussionId },
      { populate: ['note'] },
    )

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to create answer: discussion not found or inaccessible.',
      )
    }
    const discussionNote = discussion.note.getEntity()
    if (discussionNote.scope === 'private') {
      throw new errors.PermissionError('Unable to create answer: unpublished discussion.')
    }

    return await this.em.transactional(async () => {
      const newNote = new Note(user)
      newNote.title = dto.title
      newNote.content = dto.content
      newNote.scope = discussionNote.scope
      newNote.noteType = 'Answer'
      this.em.persist(newNote)

      const newAnswer = new Answer(newNote, discussion, user)
      await this.em.persistAndFlush(newAnswer)
      return AnswerDTO.fromEntity(newAnswer)
    })
  }

  async updateAnswer(id: number, input: UpdateAnswerDTO): Promise<AnswerDTO> {
    this.logger.log(`Updating answer: ${JSON.stringify(input)}`)
    const answer = await this.answerRepository.findEditableOne({ id }, { populate: ['note'] })

    if (!answer) {
      throw new errors.NotFoundError(
        'Unable to update answer: not found or insufficient permissions.',
      )
    }
    const note = answer.note.getEntity()
    if (input?.content) {
      note.content = input.content
    }
    await this.em.persistAndFlush(note)
    return AnswerDTO.fromEntity(answer)
  }

  async deleteAnswer(answerId: number): Promise<void> {
    this.logger.log(`Deleting answer with id: ${answerId}`)

    const answer = await this.answerRepository.findEditableOne(
      { id: answerId },
      { populate: ['note', 'comments', 'note.attachments'] },
    )

    if (answer === null) {
      throw new errors.NotFoundError(
        'Unable to delete answer: not found or insufficient permissions.',
      )
    }

    return await this.em.transactional(async () => {
      const answerNote = answer.note.getEntity()
      const answerVotes = await this.em.find(Vote, {
        votableId: answerId,
        votableType: 'Answer',
      })
      const noteVotes = await this.em.find(Vote, {
        votableId: answerNote.id,
        votableType: 'Note',
      })
      this.logger.log(`Deleting answer votes with ids: ${answerVotes.map((vote) => vote.id)}`)
      this.em.remove(answerVotes)
      this.logger.log(`Deleting note votes with ids: ${noteVotes.map((vote) => vote.id)}`)
      this.em.remove(noteVotes)
      this.logger.log(`Deleting answer with id: ${answer.id}`)
      await this.em.removeAndFlush(answer)
    })
  }

  async createComment(commentInput: CreateCommentDTO): Promise<CommentDTO> {
    this.logger.log(`Creating comment: ${JSON.stringify(commentInput)}`)

    const user = await this.userCtx.loadEntity()
    if (!user) {
      throw new errors.NotFoundError('User not found.')
    }

    if (commentInput.discussionId) {
      const target = await this.discussionRepository.findAccessibleOne(
        { id: commentInput.discussionId },
        { populate: ['note'] },
      )
      if (!target) {
        throw new errors.NotFoundError(
          `Unable to create comment: Discussion (id:${commentInput.discussionId}) not found or insufficient permissions.`,
        )
      }
      const newComment = new DiscussionComment(user)
      newComment.body = commentInput.content
      newComment.commentable = Reference.create(target)
      // other params are intentionally null.
      await this.em.persistAndFlush(newComment)
      return await CommentDTO.fromEntity(newComment)
    }

    const target = await this.answerRepository.findAccessibleOne(
      {
        id: commentInput.answerId,
      },
      { populate: ['note'] },
    )
    if (!target) {
      throw new errors.NotFoundError(
        `Unable to create comment: Answer (id: ${commentInput.answerId}) not found or insufficient permissions.`,
      )
    }
    const newComment = new AnswerComment(user)
    newComment.body = commentInput.content
    newComment.commentable = Reference.create(target)
    // other params are intentionally null.
    await this.em.persistAndFlush(newComment)
    return await CommentDTO.fromEntity(newComment)
  }

  async updateComment(id: number, commentInput: UpdateCommentDTO): Promise<CommentDTO> {
    this.logger.log(`Editing comment: ${JSON.stringify(commentInput)}`)

    const user = await this.userCtx.loadEntity()
    const comment = await this.em.findOne(Comment, id)
    const commentClass = comment instanceof DiscussionComment ? DiscussionComment : AnswerComment
    const commentEntity = await this.em.findOne(commentClass, id, { populate: ['commentable'] })

    if (!commentEntity || !(await commentEntity.isEditableBy(user))) {
      throw new errors.NotFoundError(
        'Unable to edit comment: comment not found or insufficient permissions.',
      )
    }
    commentEntity.body = commentInput.content
    await this.em.persistAndFlush(comment)
    return await CommentDTO.fromEntity(commentEntity)
  }

  async deleteComment(commentId: number, type: CommentableType): Promise<void> {
    this.logger.log(`Deleting comment with id: ${commentId}`)

    const user = await this.userCtx.loadEntity()

    let comment: AnswerComment | DiscussionComment | null
    if (type == 'Discussion') {
      comment = await this.em.findOne(DiscussionComment, commentId, { populate: ['commentable'] })
    } else if (type === 'Answer') {
      comment = await this.em.findOne(AnswerComment, commentId, { populate: ['commentable'] })
    } else throw new errors.InvalidStateError('Invalid comment type.')

    if (!comment || !(await comment.isEditableBy(user))) {
      throw new errors.NotFoundError(
        'Unable to delete comment: comment not found or insufficient permissions.',
      )
    }

    // remove this in favor of isEditableBy
    if (comment.user.id === this.userCtx.id) {
      this.logger.log(`Deleting comment with id: ${comment.id}`)
      await this.em.removeAndFlush(comment)
      return
    } else {
      const note = await comment.commentable.getEntity().note.load()
      const spaceId = note.getSpaceId()
      const space = await this.em.findOne(Space, {
        id: spaceId,
        spaceMemberships: {
          user: this.userCtx.id,
          role: SPACE_MEMBERSHIP_ROLE.LEAD,
        },
      })
      if (space) {
        this.logger.log(`Deleting comment with id: ${comment.id}`)
        await this.em.removeAndFlush(comment)
        return
      }
    }

    throw new errors.PermissionError('Unable to delete comment: insufficient permissions.')
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
      throw new errors.NotFoundError(
        'Unable to get discussion: not found or insufficient permissions.',
      )
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

  /**
   * Get all users following the discussion, including the discussion owner.
   * Only currently active users are returned.
   * @param discussionId
   */
  async getFollowers(discussionId: number): Promise<User[]> {
    const discussion = await this.discussionRepository.findOne({ id: discussionId })
    if (!discussion) {
      throw new errors.NotFoundError('Discussion not found.')
    }
    await discussion.follows.load()
    // filter out only user ids
    const userIDs = discussion.follows
      .getItems()
      .filter((follow) => follow.followerType === 'User')
      .map((follow) => follow.followerId)

    return await this.em.find(User, { id: { $in: userIDs }, userState: USER_STATE.ENABLED })
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
    return this.entityLinkService.getUiLink(answer)
  }

  async getCommentUiLink(commentId: number): Promise<string> {
    this.logger.log(`Generating UI-link to comment: ${commentId} for user: ${this.userCtx.id}`)
    const comment = await this.em.findOne(Comment, { id: commentId })
    return this.entityLinkService.getUiLink(comment)
  }
}
