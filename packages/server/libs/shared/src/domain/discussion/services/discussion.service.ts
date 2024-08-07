import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import { App } from '@shared/domain/app/app.entity'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Follow } from '@shared/domain/follow/follow.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Note } from '@shared/domain/note/note.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Vote } from '@shared/domain/vote/vote.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import type { UserCtx } from '@shared/types'
import type { SCOPE } from '@shared/types/common'
import * as errors from '../../../errors'
import { CommentableType } from '../../comment/comment.entity'
import { EntityFetcherService } from '../../entity/entity-fetcher.service'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { getIdFromScopeName } from '../../space/space.helper'
import type {
  BaseInput,
  CreateAnswerInput,
  CreateCommentInput,
  DiscussionAttachment,
  EditCommentInput,
  PublishAnswerInput,
  PublishDiscussionInput,
  UpdateAnswerInput,
  UpdateDiscussionInput,
} from '../discussion.types'
import { AnswerDTO, CommentDTO, DiscussionDTO, NoteDTO, UserDTO } from '../discussion.types'
import { DiscussionNotificationService } from './discussion-notification.service'
import { PublisherService } from './publisher.service'

export interface IDiscussionService {
  createDiscussion(discussionInput: BaseInput): Promise<DiscussionDTO>

  updateDiscussion(discussionInput: UpdateDiscussionInput): Promise<void>

  publishDiscussion(discussionInput: PublishDiscussionInput): Promise<number>

  deleteDiscussion(discussionId: number): Promise<void>

  getDiscussions(scope: string): Promise<DiscussionDTO[]>

  getDiscussion(discussionId: number): Promise<DiscussionDTO>

  // answers part
  createAnswer(answerInput: CreateAnswerInput): Promise<AnswerDTO>

  updateAnswer(answerInput: UpdateAnswerInput): Promise<void>

  publishAnswer(answerInput: PublishAnswerInput): Promise<number>

  deleteAnswer(answerId: number): Promise<void>

  getAnswers(discussionId: number): Promise<AnswerDTO[]>

  getAnswer(answerId: number): Promise<AnswerDTO>

  // comments part
  createComment(commentInput: CreateCommentInput): Promise<CommentDTO>

  updateComment(commentInput: EditCommentInput): Promise<CommentDTO>

  deleteComment(commentId: number, type: CommentableType): Promise<void>

  getComment(commentId: number, type: CommentableType): Promise<CommentDTO>

  // attachments
  getAttachments(
    noteId: number,
  ): Promise<Array<{ id: number; uid: string; type: string; name: string }>>
}

@Injectable()
export class DiscussionService implements IDiscussionService {
  @ServiceLogger()
  private readonly logger: Logger

  private readonly em: SqlEntityManager
  private readonly userCtx: UserCtx
  private readonly publisher: PublisherService
  private readonly fetcher: EntityFetcherService
  private readonly entityService: EntityService
  private readonly discussionNotificationService: DiscussionNotificationService

  constructor(
    em: SqlEntityManager,
    userCtx: UserContext,
    publisherService: PublisherService,
    fetcher: EntityFetcherService,
    entityService: EntityService,
    discussionNotificationService: DiscussionNotificationService,
  ) {
    this.em = em
    this.userCtx = userCtx
    this.publisher = publisherService
    this.fetcher = fetcher
    this.entityService = entityService
    this.discussionNotificationService = discussionNotificationService
    this.logger.debug('DiscussionService initialized')
  }

  async getDiscussion(discussionId: number): Promise<DiscussionDTO> {
    this.logger.log(`Getting discussion id: ${discussionId}`)
    const res = await this.fetcher.getAccessibleById(
      Discussion,
      discussionId,
      {},
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
        ],
      },
    )
    if (!res) {
      throw new errors.NotFoundError(
        'Unable to get discussion: not found or insufficient permissions.',
      )
    }
    return this.mapDiscussionDTO(res)
  }

  async getAnswers(discussionId: number): Promise<AnswerDTO[]> {
    this.logger.log(`Getting answers for discussion id: ${discussionId}`)
    const user = await this.fetcher.getById(User, this.userCtx.id)
    if (!user) {
      throw new errors.NotFoundError('User not found.')
    }
    const discussion = await this.fetcher.getAccessibleById(
      Discussion,
      discussionId,
      {},
      { populate: ['note'] },
    )
    if (!discussion) {
      throw new errors.NotFoundError('Unable to get answers: discussion not found or inaccessible.')
    }
    const answers = await this.fetcher.getAccessible(
      Answer,
      { discussion },
      { populate: ['note', 'user'] },
    )
    return answers.map((answer) => this.mapAnswerDTO(answer))
  }

  /**
   * Creates discussion and related note and persists them in a database. Returns error when an error occurs.
   * @param discussionInput
   */
  async createDiscussion(discussionInput: BaseInput) {
    this.logger.log(`Creating discussion: ${JSON.stringify(discussionInput)}`)
    const user = await this.fetcher.getById(User, this.userCtx.id)
    if (!user) {
      throw new errors.NotFoundError(`User not found ({ id: ${this.userCtx.id} })`)
    }

    return await this.em.transactional(async (tem) => {
      const newNote = new Note(user)

      newNote.title = discussionInput.title
      newNote.content = discussionInput.content
      newNote.scope = STATIC_SCOPE.PRIVATE
      newNote.noteType = 'Discussion'
      tem.persist(newNote)

      const newDiscussion = new Discussion(newNote, user)
      await tem.persistAndFlush(newDiscussion)
      await this.createAttachments(newNote, discussionInput.attachments)

      const newFollow = new Follow()
      newFollow.followableId = newDiscussion.id
      newFollow.followableType = 'Discussion'
      newFollow.followerId = user.id
      newFollow.followerType = 'User'
      newFollow.blocked = false
      tem.persist(newFollow)
      return this.mapDiscussionDTO(newDiscussion)
    })
  }

  async updateDiscussion(discussionInput: UpdateDiscussionInput): Promise<void> {
    this.logger.log(`Updating discussion: ${JSON.stringify(discussionInput)}`)

    return await this.em.transactional(async () => {
      const discussion = await this.fetcher.getEditableById(
        Discussion,
        discussionInput.id,
        {},
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
      this.em.persist(note)

      if (discussionInput.attachments) {
        await this.updateAttachments(note, discussionInput.attachments)
      }
    })
  }

  async publishDiscussion(discussionInput: PublishDiscussionInput): Promise<number> {
    this.logger.log(`Publishing discussion: ${JSON.stringify(discussionInput)}`)

    const user = await this.fetcher.getById(User, this.userCtx.id)
    // this will probably never happen, maybe have a separate method for fetching 'myself' by context and avoid checking for null everytime.
    if (!user) {
      throw new errors.NotFoundError(`User not found ({ id: ${this.userCtx.id} })`)
    }

    const discussion = await this.fetcher.getEditableById(
      Discussion,
      discussionInput.id,
      {},
      { populate: ['note'] },
    )
    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to publish discussion: not found or insufficient permissions.',
      )
    }

    let space: Space | null = null
    if (discussionInput.scope.startsWith('space')) {
      space = await this.getSpaceFromScope(discussionInput.scope)

      if (space.type === SPACE_TYPE.REVIEW && space.meta?.restricted_discussions) {
        throw new errors.InvalidStateError('Unable to publish discussion: space has restricted discussions.')
      }
    }

    const count = await this.em.transactional(async (tem) => {
      let count = 0
      if (discussionInput.scope === 'public') {
        // TODO Jiri: How to solve already changed entities on platform when an error occurs?
        count = await this.publishAttachments(
          discussionInput.toPublish,
          user,
          discussionInput.scope,
        )
      } else {
        await this.checkValidScope(discussionInput.toPublish, discussionInput.scope)
      }

      const note = discussion.note.getEntity()
      note.scope = discussionInput.scope
      tem.persist(note)
      return count
    })
    if (discussionInput.notifyAll && space) {
      await this.discussionNotificationService.notifyDiscussion(space, discussion)
    }
    return count
  }

  async deleteDiscussion(discussionId: number): Promise<void> {
    this.logger.log(`Deleting discussion: ${discussionId}`)
    const discussion = await this.fetcher.getEditableById(
      Discussion,
      discussionId,
      {},
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
      throw new errors.NotFoundError('Unable to delete discussion: insufficient permissions.')
    }

    await this.em.transactional(async (tem) => {
      const discussionNote = discussion.note.getEntity()
      if (discussionNote.scope !== STATIC_SCOPE.PUBLIC && discussion.user.id !== this.userCtx.id) {
        const space = await this.em.findOne(Space, {
          id: getIdFromScopeName(discussionNote.scope),
          spaceMemberships: {
            user: this.userCtx.id,
            role: { $in: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD] },
          },
        })
        if (!space) {
          throw new errors.PermissionError('Unable to delete discussion: insufficient permissions.')
        }
      }

      const discussionVotes = await tem.find(Vote, {
        votableId: discussionId,
        votableType: 'Discussion',
      })
      const noteVotes = await tem.find(Vote, {
        votableId: discussionNote.id,
        votableType: 'Note',
      })
      const follows = await tem.find(Follow, {
        followableId: discussionId,
        followableType: 'Discussion',
      })
      this.logger.log(
        `Deleting discussion votes with ids: ${discussionVotes.map((vote) => vote.id)}`,
      )
      tem.remove(discussionVotes)
      this.logger.log(`Deleting note votes with ids: ${noteVotes.map((vote) => vote.id)}`)
      tem.remove(noteVotes)
      this.logger.log(`Deleting follows with ids: ${follows.map((follow) => follow.id)}`)
      tem.remove(follows)
      // removal of discussion triggers cascade removal of answers,comments and attachments.
      this.logger.log(`Deleting discussion with id: ${discussion.id}`)
      await tem.removeAndFlush(discussion)
    })
  }

  async getDiscussions(scope: string): Promise<DiscussionDTO[]> {
    this.logger.log(`Getting discussions with scope: ${scope}`)
    if (scope === 'public') {
      const publishedDiscussions = await this.fetcher.getPublic(
        Discussion,
        {},
        { populate: ['note', 'user'] },
      )
      const privateDiscussions = await this.fetcher.getPrivate(
        Discussion,
        {},
        { populate: ['note', 'user'] },
      )

      return await Promise.all(
        privateDiscussions
          .concat(publishedDiscussions)
          .map((discussion) => this.mapDiscussionDTO(discussion)),
      )
    }
    const spaceId = getIdFromScopeName(scope)
    // const space = await this.fetcher.getEditableById(Space, spaceId)
    // find space with correct permissions
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
    const spaceDiscussions = await this.fetcher.getFromSpace(
      Discussion,
      spaceId,
      {},
      { populate: ['note', 'user'] },
    )
    return await Promise.all(
      spaceDiscussions.map((discussion) => this.mapDiscussionDTO(discussion)),
    )
  }

  async createAnswer(answerInput: CreateAnswerInput) {
    this.logger.log(`Creating answer: ${JSON.stringify(answerInput)}`)
    const discussion = await this.fetcher.getAccessibleById(
      Discussion,
      answerInput.discussionId,
      {},
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

    const user = await this.fetcher.getById(User, this.userCtx.id)
    if (!user) {
      throw new errors.NotFoundError('User not found.')
    }

    const answers = await this.fetcher.getEditable(Answer, { discussion, user: this.userCtx.id })
    if (answers.length > 0) {
      throw new errors.InvalidStateError(
        'Unable to create answer: discussion already has an answer from you.',
      )
    }

    return await this.em.transactional(async (tem) => {
      const newNote = new Note(user)
      newNote.title = answerInput.title
      newNote.content = answerInput.content
      newNote.scope = STATIC_SCOPE.PRIVATE
      newNote.noteType = 'Answer'
      tem.persist(newNote)
      await this.createAttachments(newNote, answerInput.attachments)

      const newAnswer = new Answer(newNote, discussion, user)
      await tem.persistAndFlush(newAnswer)
      return this.mapAnswerDTO(newAnswer)
    })
  }

  async updateAnswer(input: UpdateAnswerInput) {
    this.logger.log(`Updating answer: ${JSON.stringify(input)}`)
    const answer = await this.fetcher.getEditableById(
      Answer,
      input.answerId,
      {},
      { populate: ['note'] },
    )

    if (!answer) {
      throw new errors.NotFoundError(
        'Unable to update answer: not found or insufficient permissions.',
      )
    }
    const note = answer.note.getEntity()

    return await this.em.transactional(async (tem) => {
      // answer title cannot be changed from UI. Only content and attachments can be changed.
      if (input?.content) {
        note.content = input.content
      }
      tem.persist(note)

      if (input?.attachments) {
        await this.updateAttachments(note, input.attachments)
      }
      await tem.commit()
    })
  }

  async publishAnswer(answerInput: PublishAnswerInput) {
    this.logger.log(`Publishing answer: ${JSON.stringify(answerInput)}`)

    const user = await this.fetcher.getById(User, this.userCtx.id)
    if (!user) {
      throw new errors.NotFoundError('User not found.')
    }

    if (answerInput.scope === 'private') {
      throw new errors.InvalidStateError('Unable to publish answer: private scope.')
    }

    const answer = await this.fetcher.getEditableById(
      Answer,
      answerInput.id,
      {},
      { populate: ['note'] },
    )
    if (!answer) {
      throw new errors.NotFoundError(
        'Unable to publish answer: not found or insufficient permissions.',
      )
    }

    let space: Space | null = null
    if (answerInput.scope.startsWith('space')) {
      space = await this.getSpaceFromScope(answerInput.scope)
    }

    const count = await this.em.transactional(async (tem) => {
      let count = 0
      if (answerInput.scope === 'public') {
        count = await this.publishAttachments(answerInput.toPublish, user, answerInput.scope)
      } else {
        await this.checkValidScope(answerInput.toPublish, answerInput.scope)
      }

      const note = answer.note.getEntity()
      note.scope = answerInput.scope
      tem.persist(note)
      return count
    })

    if (answerInput.notifyAll && space) {
      await this.discussionNotificationService.notifyDiscussionAnswer(space, answer)
    }
    return count
  }

  async deleteAnswer(answerId: number) {
    this.logger.log(`Deleting answer with id: ${answerId}`)
    const answer = await this.fetcher.getEditableById(
      Answer,
      answerId,
      {},
      { populate: ['note', 'comments', 'note.attachments'] },
    )
    if (answer === null) {
      throw new errors.NotFoundError(
        'Unable to delete answer: not found or insufficient permissions.',
      )
    }

    return await this.em.transactional(async (tem) => {
      const answerNote = answer.note.getEntity()
      const answerVotes = await tem.find(Vote, {
        votableId: answerId,
        votableType: 'Answer',
      })
      const noteVotes = await tem.find(Vote, {
        votableId: answerNote.id,
        votableType: 'Note',
      })
      const follows = await tem.find(Follow, {
        followableId: answerId,
        followableType: 'Answer',
      })
      this.logger.log(`Deleting answer votes with ids: ${answerVotes.map((vote) => vote.id)}`)
      tem.remove(answerVotes)
      this.logger.log(`Deleting note votes with ids: ${noteVotes.map((vote) => vote.id)}`)
      tem.remove(noteVotes)
      this.logger.log(`Deleting follows with ids: ${follows.map((follow) => follow.id)}`)
      tem.remove(follows)
      this.logger.log(`Deleting answer with id: ${answer.id}`)
      await tem.removeAndFlush(answer)
    })
  }

  private async publishAttachments(
    toPublish: {
      files?: number[]
      assets?: number[]
      apps?: number[]
      jobs?: number[]
      comparisons?: number[]
    },
    user: User,
    scope: SCOPE,
  ) {
    let count = 0

    const toPublishEntities: {
      File: Node[]
      App: App[]
      Comparison: Comparison[]
      Job: Job[]
    } = {
      File: [],
      App: [],
      Comparison: [],
      Job: [],
    }
    // nodes
    for (const id of toPublish.files) {
      const file = await this.fetcher.getAccessibleById(Node, id)
      if (!file) {
        throw new errors.NotFoundError(`Unable to publish: file ${id} not found or inaccessible.`)
      }
      toPublishEntities.File.push(file)
    }
    for (const id of toPublish.assets) {
      const asset = await this.fetcher.getAccessibleById(Node, id)
      if (!asset) {
        throw new errors.NotFoundError(`Unable to publish: asset ${id} not found or inaccessible.`)
      }
      toPublishEntities.File.push(asset)
    }
    // apps
    for (const id of toPublish.apps) {
      const app = await this.fetcher.getAccessibleById(App, id)
      if (!app) {
        throw new errors.NotFoundError(`Unable to publish: app ${id} not found or inaccessible.`)
      }
      toPublishEntities.App.push(app)
    }
    // comparisons
    for (const id of toPublish.comparisons) {
      const comparison = await this.fetcher.getAccessibleById(Comparison, id)
      if (!comparison) {
        throw new errors.NotFoundError(
          `Unable to publish: comparison ${id} not found or inaccessible.`,
        )
      }
      toPublishEntities.Comparison.push(comparison)
    }
    // jobs
    for (const id of toPublish.jobs) {
      const job = await this.fetcher.getAccessibleById(Job, id)
      if (!job) {
        throw new errors.NotFoundError(`Unable to publish: job ${id} not found or inaccessible.`)
      }
      toPublishEntities.Job.push(job)
    }

    // nodes and assets share logic for publishing via nodes.
    count += await this.publisher.publishNodes(toPublishEntities.File, user, scope)
    count += await this.publisher.publishComparisons(toPublishEntities.Comparison, user, scope)
    count += await this.publisher.publishApps(toPublishEntities.App, user, scope)
    count += await this.publisher.publishJobs(toPublishEntities.Job, user, scope)
    return count
  }

  private async createAttachments(
    note: Note,
    attachmentsToSave: {
      files?: number[]
      folders?: number[]
      assets?: number[]
      apps?: number[]
      jobs?: number[]
      comparisons?: number[]
    },
  ) {
    for (const id of attachmentsToSave.files) {
      // if it's not accessible it will fail. - but maybe it's better to return null and let caller handle the case?
      const res = await this.fetcher.getAccessibleById(Node, id)
      if (!res) {
        throw new errors.NotFoundError(
          `Unable to attach file ${id}: file not found or inaccessible.`,
        )
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'Node'
      this.em.persist(attachment)
    }
    for (const id of attachmentsToSave.folders) {
      const res = await this.fetcher.getAccessibleById(Node, id)
      if (!res) {
        throw new errors.NotFoundError(
          `Unable to attach folder ${id}: folder not found or inaccessible.`,
        )
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'Node'
      this.em.persist(attachment)
    }
    for (const id of attachmentsToSave.assets) {
      // if it's not accessible it will fail. - but maybe it's better to return null and let caller handle the case?
      const res = await this.fetcher.getAccessibleById(Node, id)
      if (!res) {
        throw new errors.NotFoundError(
          `Unable to attach asset ${id}: asset not found or inaccessible.`,
        )
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'Node'
      this.em.persist(attachment)
    }
    for (const id of attachmentsToSave.apps) {
      const res = await this.fetcher.getAccessibleById(App, id)
      if (!res) {
        throw new errors.NotFoundError(`Unable to attach app ${id}: app not found or inaccessible.`)
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'App'
      this.em.persist(attachment)
    }
    for (const id of attachmentsToSave.jobs) {
      const res = await this.fetcher.getAccessibleById(Job, id)
      if (!res) {
        throw new errors.NotFoundError(`Unable to attach job ${id}: job not found or inaccessible.`)
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'Job'
      this.em.persist(attachment)
    }
    for (const id of attachmentsToSave.comparisons) {
      const res = await this.fetcher.getAccessibleById(Comparison, id)
      if (!res) {
        throw new errors.NotFoundError(
          `Unable to attach comparison ${id}: comparison not found or inaccessible.`,
        )
      }
      const attachment = new Attachment(note)
      attachment.itemId = id
      attachment.itemType = 'Comparison'
      this.em.persist(attachment)
    }
    await this.em.flush()
  }

  private async updateAttachments(
    note: Note,
    attachments: {
      files?: number[]
      folders?: number[]
      assets?: number[]
      apps?: number[]
      jobs?: number[]
      comparisons?: number[]
    },
  ) {
    const oldAttachments = await this.em.find(Attachment, { note })
    this.logger.log(`Deleting old attachments: ${oldAttachments.map((a) => a.id)}`)
    await this.em.removeAndFlush(oldAttachments)
    this.logger.log(`Creating new attachments: ${JSON.stringify(attachments)}`)
    await this.createAttachments(note, attachments)
  }

  /**
   * Checks items to be published are already in the space scope or are public.
   * @param toPublish - items to be published
   * @param scope - scope to publish to
   * @private - only for internal use while publishing to space.
   */
  private async checkValidScope(
    toPublish: {
      files?: number[]
      folders?: number[]
      assets?: number[]
      apps?: number[]
      jobs?: number[]
      comparisons?: number[]
    },
    scope: string,
  ) {
    // nodes - TODO Jiri: refactor to fetch all at once.
    for (const id of toPublish.files) {
      const file = await this.fetcher.getAccessibleById(Node, id)
      if (!file) {
        throw new errors.NotFoundError(`Unable to publish: file ${id} not found or inaccessible.`)
      }
      if (![STATIC_SCOPE.PUBLIC, scope].includes(file.scope)) {
        throw new errors.InvalidStateError(
          'Unable to publish file - file is not in the space or is not public.',
        )
      }
    }
    for (const id of toPublish.assets) {
      const asset = await this.fetcher.getAccessibleById(Node, id)
      if (!asset) {
        throw new errors.NotFoundError(`Unable to publish: asset ${id} not found or inaccessible.`)
      }
      if (![STATIC_SCOPE.PUBLIC, scope].includes(asset.scope)) {
        throw new errors.InvalidStateError(
          'Unable to publish asset - file is not in the space or is not public.',
        )
      }
    }
    // apps - TODO Jiri: refactor to fetch all at once.
    for (const id of toPublish.apps) {
      const app = await this.fetcher.getAccessibleById(App, id)
      if (!app) {
        throw new errors.NotFoundError(`Unable to publish: app ${id} not found or inaccessible.`)
      }
      if (app.scope && ![STATIC_SCOPE.PUBLIC, scope].includes(app.scope)) {
        throw new errors.InvalidStateError(
          'Unable to publish app - app is not in the space or is not public.',
        )
      }
    }
    // comparisons - TODO Jiri: refactor to fetch all at once.
    for (const id of toPublish.comparisons) {
      const comparison = await this.fetcher.getAccessibleById(Comparison, id)
      if (!comparison) {
        throw new errors.NotFoundError(
          `Unable to publish: comparison ${id} not found or inaccessible.`,
        )
      }
      if (comparison.scope && ![STATIC_SCOPE.PUBLIC, scope].includes(comparison.scope)) {
        throw new errors.InvalidStateError(
          'Unable to publish comparison - comparison is not in the space or is not public.',
        )
      }
    }
    // jobs - TODO Jiri: refactor to fetch all at once.
    for (const id of toPublish.jobs) {
      const job = await this.fetcher.getAccessibleById(Job, id)
      if (!job) {
        throw new errors.NotFoundError(`Unable to publish: job ${id} not found or inaccessible.`)
      }
      if (![STATIC_SCOPE.PUBLIC, scope].includes(job.scope)) {
        throw new errors.InvalidStateError(
          'Unable to publish job - job is not in the space or is not public.',
        )
      }
    }
  }

  async createComment(commentInput: CreateCommentInput) {
    this.logger.log(`Creating comment: ${JSON.stringify(commentInput)}`)

    const user = await this.fetcher.getById(User, this.userCtx.id)
    if (!user) {
      throw new errors.NotFoundError('User not found.')
    }

    if (commentInput.targetType === 'Discussion') {
      const target = await this.fetcher.getAccessibleById(Discussion, commentInput.targetId)
      if (!target) {
        throw new errors.NotFoundError(
          `Unable to create comment: ${commentInput.targetType} not found or insufficient permissions.`,
        )
      }
      const newComment = new DiscussionComment(user)
      newComment.body = commentInput.comment
      newComment.commentableId = Reference.create(target)
      // other params are intentionally null.
      await this.em.persistAndFlush(newComment)
      if (commentInput.notifyAll) {
        await this.em.populate(target, ['note'])
        const space = await this.getSpaceFromScope(target.note.getEntity().scope)
        await this.discussionNotificationService.notifyDiscussionComment(space, target)
      }
      return this.mapCommentDTO(newComment)
    }
    const target = await this.fetcher.getAccessibleById(Answer, commentInput.targetId)
    if (!target) {
      throw new errors.NotFoundError(
        `Unable to create comment: ${commentInput.targetType} not found or insufficient permissions.`,
      )
    }
    const newComment = new AnswerComment(user)
    newComment.body = commentInput.comment
    newComment.commentableId = Reference.create(target)
    // other params are intentionally null.
    await this.em.persistAndFlush(newComment)
    if (commentInput.notifyAll) {
      await this.em.populate(target, ['discussion', 'note'])
      const discussion = await target.discussion.getEntity()
      const space = await this.getSpaceFromScope(target.note.getEntity().scope)
      await this.discussionNotificationService.notifyDiscussionComment(space, discussion)
    }
    return this.mapCommentDTO(newComment)
  }

  async updateComment(commentInput: EditCommentInput) {
    this.logger.log(`Editing comment: ${JSON.stringify(commentInput)}`)

    if (commentInput.targetType === 'Discussion') {
      const comment = await this.fetcher.getEditableById(DiscussionComment, commentInput.id)
      if (!comment) {
        throw new errors.NotFoundError(
          'Unable to edit comment: comment not found or insufficient permissions.',
        )
      }
      comment.body = commentInput.comment
      await this.em.persistAndFlush(comment)
      return this.mapCommentDTO(comment)
    }
    const comment = await this.fetcher.getEditableById(AnswerComment, commentInput.id)
    if (!comment) {
      throw new errors.NotFoundError(
        'Unable to edit comment: comment not found or insufficient permissions.',
      )
    }
    comment.body = commentInput.comment
    await this.em.persistAndFlush(comment)
    return this.mapCommentDTO(comment)
  }

  async deleteComment(commentId: number, type: CommentableType) {
    this.logger.log(`Deleting comment with id: ${commentId}`)

    let comment: AnswerComment | DiscussionComment | null
    if (type == 'Discussion') {
      comment = await this.fetcher.getEditableById(
        DiscussionComment,
        commentId,
        {},
        { populate: ['commentableId'] },
      )
    } else {
      comment = await this.fetcher.getEditableById(
        AnswerComment,
        commentId,
        {},
        { populate: ['commentableId'] },
      )
    }
    if (!comment) {
      throw new errors.NotFoundError(
        'Unable to delete comment: comment not found or insufficient permissions.',
      )
    }

    if (comment.user.id === this.userCtx.id) {
      this.logger.log(`Deleting comment with id: ${comment.id}`)
      await this.em.removeAndFlush(comment)
      return
    } else {
      const note = await comment.commentableId.getEntity().note.load()
      const targetScope = note.scope
      const spaceId = getIdFromScopeName(targetScope)
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

  async getAttachments(noteId: number): Promise<DiscussionAttachment[]> {
    this.logger.log(`Getting attachments for note id: ${noteId}`)
    const note = await this.fetcher.getAccessibleById(
      Note,
      noteId,
      {},
      { populate: ['attachments'] },
    )
    if (!note) {
      throw new errors.NotFoundError(
        'Unable to get attachments: note not found or insufficient permissions.',
      )
    }

    const response: DiscussionAttachment[] = []
    for (const attachment of note.attachments) {
      if (attachment.itemType === 'Node') {
        const attachmentEntity: Node | null = await this.fetcher.getById(
          attachment.itemType,
          attachment.itemId,
        )
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.uid,
          type: attachmentEntity.stiType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity as UserFile | Asset),
        })
      } else if (attachment.itemType === 'Job') {
        const attachmentEntity: Job | null = await this.fetcher.getById(
          attachment.itemType,
          attachment.itemId,
        )
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.uid,
          type: attachment.itemType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity),
        })
      } else if (attachment.itemType === 'Comparison') {
        const attachmentEntity: Comparison | null = await this.fetcher.getById(
          attachment.itemType,
          attachment.itemId,
        )
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.id.toString(),
          type: attachment.itemType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity),
        })
      } else if (attachment.itemType === 'App') {
        const appAttachment: App | null = await this.fetcher.getById(
          attachment.itemType,
          attachment.itemId,
        )
        if (!appAttachment) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: appAttachment.uid,
          type: attachment.itemType,
          name: appAttachment.title,
          link: await this.entityService.getEntityUiLink(appAttachment),
        })
      }
    }
    return response
  }

  async getAnswer(answerId: number): Promise<AnswerDTO> {
    this.logger.log(`Getting answer with id: ${answerId}`)
    const res = await this.fetcher.getAccessibleById(
      Answer,
      answerId,
      {},
      { populate: ['note', 'user', 'comments', 'comments.user'] },
    )
    if (!res) {
      throw new errors.NotFoundError(
        'Unable to get discussion: not found or insufficient permissions.',
      )
    }
    return this.mapAnswerDTO(res)
  }

  async getComment(commentId: number, type: CommentableType): Promise<CommentDTO> {
    this.logger.log(`Getting comment with id: ${commentId}`)

    if (type === 'Discussion') {
      const res = await this.em.findOne(
        DiscussionComment,
        { id: commentId },
        { populate: ['user'] },
      )
      if (!res) {
        throw new errors.NotFoundError(
          'Unable to get comment: not found or insufficient permissions.',
        )
      }
      const discussion = this.fetcher.getAccessibleById(Discussion, res.commentableId.id)
      if (!discussion) {
        throw new errors.NotFoundError(
          'Unable to get comment: not found or insufficient permissions.',
        )
      }
      return this.mapCommentDTO(res)
    } else {
      const res = await this.em.findOne(AnswerComment, { id: commentId }, { populate: ['user'] })
      if (!res) {
        throw new errors.NotFoundError(
          'Unable to get comment: not found or insufficient permissions.',
        )
      }
      const answer = this.fetcher.getAccessibleById(Answer, res.commentableId.id)
      if (!answer) {
        throw new errors.NotFoundError(
          'Unable to get comment: not found or insufficient permissions.',
        )
      }
      // refactor the response mapping - for every return in this class.
      return this.mapCommentDTO(res)
    }
  }

  private async getSpaceFromScope(scope: SCOPE): Promise<Space | null> {
    const spaceId = getIdFromScopeName(scope)
    if (spaceId === null) {
      return
    }
    const space = await this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: {
        user: this.userCtx.id,
        role: {
          $in: [
            SPACE_MEMBERSHIP_ROLE.ADMIN,
            SPACE_MEMBERSHIP_ROLE.LEAD,
            SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          ],
        },
      },
    })
    if (!space) {
      throw new errors.PermissionError('Unable to publish: insufficient permissions.')
    }
    return space
  }

  private async mapDiscussionDTO(discussion: Discussion): Promise<DiscussionDTO> {
    const discussionDTO = new DiscussionDTO()
    discussionDTO.id = discussion.id
    discussionDTO.createdAt = discussion.createdAt
    discussionDTO.updatedAt = discussion.updatedAt
    if (discussion.note.isInitialized()) {
      discussionDTO.note = this.mapNoteDTO(discussion.note.getEntity())
    }
    if (discussion.user.isInitialized()) {
      discussionDTO.user = this.mapUserDTO(discussion.user.getEntity())
    }
    if (discussion.answers.isInitialized()) {
      discussionDTO.answers = discussion.answers
        .getItems()
        .map((answer) => this.mapAnswerDTO(answer))
      discussionDTO.answersCount = discussion.answers.count()
    } else {
      discussionDTO.answers = []
      discussionDTO.answersCount = await discussion.answers.loadCount()
    }
    if (discussion.comments.isInitialized()) {
      discussionDTO.comments = discussion.comments
        .getItems()
        .map((comment) => this.mapCommentDTO(comment))
      discussionDTO.commentsCount = discussion.comments.count()
    } else {
      discussionDTO.comments = []
      discussionDTO.commentsCount = await discussion.comments.loadCount()
    }
    return discussionDTO
  }

  private mapNoteDTO(note: Note): NoteDTO {
    const noteDTO = new NoteDTO()
    noteDTO.id = note.id
    noteDTO.createdAt = note.createdAt
    noteDTO.updatedAt = note.updatedAt
    noteDTO.title = note.title
    noteDTO.content = note.content
    noteDTO.noteType = note.noteType
    noteDTO.scope = note.scope
    if (note.user?.isInitialized()) {
      noteDTO.user = this.mapUserDTO(note.user.getEntity())
    }
    return noteDTO
  }

  private mapAnswerDTO(answer: Answer): AnswerDTO {
    const answerDTO = new AnswerDTO()
    answerDTO.id = answer.id
    answerDTO.createdAt = answer.createdAt
    answerDTO.updatedAt = answer.updatedAt
    answerDTO.discussion = answer.discussion.id
    if (answer.note?.isInitialized()) {
      answerDTO.note = this.mapNoteDTO(answer.note.getEntity())
    }
    if (answer.user?.isInitialized()) {
      answerDTO.user = this.mapUserDTO(answer.user.getEntity())
    }
    if (answer.comments.isInitialized()) {
      answerDTO.comments = answer.comments.getItems().map((comment) => this.mapCommentDTO(comment))
    }
    return answerDTO
  }

  private mapCommentDTO(comment: DiscussionComment | AnswerComment): CommentDTO {
    const commentDTO = new CommentDTO()
    commentDTO.id = comment.id
    commentDTO.createdAt = comment.createdAt
    commentDTO.updatedAt = comment.updatedAt
    commentDTO.commentableId = comment.commentableId.id
    commentDTO.commentableType = comment.commentableType
    commentDTO.body = comment.body
    if (comment.user?.isInitialized()) {
      commentDTO.user = this.mapUserDTO(comment.user.getEntity())
    }
    return commentDTO
  }

  private mapUserDTO(user: User): UserDTO {
    const userDTO = new UserDTO()
    userDTO.id = user.id
    userDTO.dxuser = user.dxuser
    userDTO.firstName = user.firstName
    userDTO.lastName = user.lastName
    userDTO.fullName = user.fullName
    return userDTO
  }
}
