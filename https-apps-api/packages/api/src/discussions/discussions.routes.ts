import type { DefaultState } from 'koa'
import Router from 'koa-router'
import {
  discussion as discussionDomain,
  errors,
  client,
  entityFetcher,
  utils,
} from '@pfda/https-apps-shared'
import { validateBodyMiddleware } from '../server/middleware/validateBody'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { isRequestFromAuthenticatedUser } from '../server/utils'
import type {
  AnswerPostReqBody,
  AnswerPutReqBody,
  DiscussionsPostReqBody,
  DiscussionsPublishReqBody,
  DiscussionsPutReqBody,
  CommentReqBody,
} from './discussions.schemas'
import {
  answerPostRequestSchema,
  answerPutRequestSchema,
  commentsPostRequestSchema,
  discussionsPostRequestSchema,
  discussionsPublishRequestSchema,
  discussionsPutRequestSchema,
} from './discussions.schemas'
import {
  CreateCommentInput,
  EditCommentInput,
} from '@pfda/https-apps-shared/src/domain/discussion/discussion.types'
import { CommentableType } from '@pfda/https-apps-shared/src/domain/comment/comment.entity'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

const getDiscussionService = (ctx: Api.Ctx) => {
  if (!isRequestFromAuthenticatedUser(ctx)) {
    throw new errors.PermissionError('Unauthenticated user')
  }
  // TODO completely replace with IoC
  const publisherService = new discussionDomain.PublisherService(
    ctx.em,
    ctx.user,
    new client.PlatformClient(ctx.user.accessToken),
  )
  const fetcherService = new entityFetcher.EntityFetcherService(ctx.em, ctx.user)

  return new discussionDomain.DiscussionService(ctx.em, ctx.user, publisherService, fetcherService)
}

// TODO(PFDA-4701) - add a required number validation for "discussionsId", "answerId" and "commentId" params

router.get(
  '/',
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getDiscussions(ctx.query.scope as string)
  },
)

router.get(
  '/:id',

  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getDiscussion(parseInt(ctx.params.id, 10)) // Setting type to number does not work.
  },
)

router.get(
  // TODO Jiri: refactor - we are using noteId where API standard expects discussionId.
  //  This is because we use this for both discussions and answers attachments fetch via noteId.
  '/:noteId/attachments',
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getAttachments(parseInt(ctx.params.noteId, 10))
  },
)

router.get(
  '/:id/answers/:answerId',
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getAnswer(parseInt(ctx.params.answerId, 10))
  },
)

router.post(
  '/',
  validateBodyMiddleware(discussionsPostRequestSchema),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as DiscussionsPostReqBody
    const service = getDiscussionService(ctx)
    const result = await service.createDiscussion(body)
    ctx.body = { id: result.id }
    ctx.status = 201
  },
)

router.post(
  '/:discussionId/answers',
  validateBodyMiddleware(answerPostRequestSchema),
  async (ctx: Api.Ctx) => {
    const discussionId = ctx.params.discussionId as number
    const body = ctx.request.body as AnswerPostReqBody

    const service = getDiscussionService(ctx)
    const result = await service.createAnswer({ discussionId, ...body })
    ctx.body = { id: result.id }
    ctx.status = 201
  },
)

router.put(
  '/:id',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  validateBodyMiddleware(discussionsPutRequestSchema),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as DiscussionsPutReqBody
    const service = getDiscussionService(ctx)
    await service.updateDiscussion(body)
    ctx.status = 204
  },
)

const handleCommentEdit = async (ctx: Api.Ctx, type: CommentableType) => {
  const body = ctx.request.body as CommentReqBody
  const input: EditCommentInput = {
    id: ctx.params.commentId as number,
    comment: body.content,
    targetType: type,
  }
  const service = getDiscussionService(ctx)
  const result = await service.updateComment(input)
  ctx.body = { id: result.id }
  ctx.status = 204
}

router.put(
  '/:discussionId/comments/:commentId',
  validateBodyMiddleware(commentsPostRequestSchema),
  async (ctx: Api.Ctx) => {
    await handleCommentEdit(ctx, 'Discussion')
  },
)

router.put(
  '/:discussionId/answers/:answerId',
  validateBodyMiddleware(answerPutRequestSchema),
  async (ctx: Api.Ctx) => {
    const discussionId: number = ctx.params.discussionId as number
    const answerId: number = ctx.params.answerId as number
    const body = ctx.request.body as AnswerPutReqBody
    const service = getDiscussionService(ctx)

    await service.updateAnswer({ discussionId, answerId, ...body })
    ctx.status = 204
  },
)

router.post(
  '/:id/publish',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  validateBodyMiddleware(discussionsPublishRequestSchema),
  async (ctx: Api.Ctx) => {
    const discussionId: number = ctx.params.id as number
    const body = ctx.request.body as DiscussionsPublishReqBody
    const service = getDiscussionService(ctx)
    const result = await service.publishDiscussion({
      id: discussionId,
      toPublish: body.toPublish,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })
    ctx.body = { id: discussionId, count: result }
    ctx.status = 200
  },
)

router.delete(
  '/:id',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  async (ctx: Api.Ctx) => {
    const service = getDiscussionService(ctx)
    await service.deleteDiscussion(ctx.params.id)
    ctx.status = 204
  },
)

router.delete(
  '/:discussionId/answers/:id',
  async (ctx: Api.Ctx) => {
    const service = getDiscussionService(ctx)
    await service.deleteAnswer(ctx.params.id)
    ctx.status = 204
  },
)

router.delete(
  '/:discussionId/comments/:id',
  async (ctx: Api.Ctx) => {
    const service = getDiscussionService(ctx)
    await service.deleteComment(ctx.params.id, 'Discussion')
    ctx.status = 204
  },
)


router.post(
  '/:discussionId/answers/:id/publish',
  async (ctx: Api.Ctx) => {
    const discussionId: number = ctx.params.discussionId as number
    const id: number = ctx.params.id as number
    const body = ctx.request.body as DiscussionsPublishReqBody
    const service = getDiscussionService(ctx)
    const result = await service.publishAnswer({
      discussionId,
      id,
      toPublish: body.toPublish,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })
    ctx.body = { id, count: result }
    ctx.status = 200
  },
)

router.delete(
  '/:discussionId/answers/:answerId/comments/:id',
  async (ctx: Api.Ctx) => {
    const service = getDiscussionService(ctx)
    await service.deleteComment(ctx.params.id, 'Answer')
    ctx.status = 204
  },
)

router.post(
  '/:discussionId/comments',
  validateBodyMiddleware(commentsPostRequestSchema),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as CommentReqBody
    const input: CreateCommentInput = {
      targetId: ctx.params.discussionId as number,
      targetType: 'Discussion',
      comment: body.content,
    }
    const service = getDiscussionService(ctx)
    const result = await service.createComment(input)
    ctx.body = { id: result.id }
    ctx.status = 201
  },
)

router.get(
  '/:discussionId/comments/:commentId',
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getComment(parseInt(ctx.params.commentId, 10), 'Discussion')
    ctx.status = 200
  },
)

router.get(
  '/:discussionId/answers/:answerId/comments/:commentId',
  async ctx => {
    const service = getDiscussionService(ctx)
    ctx.body = await service.getComment(parseInt(ctx.params.commentId, 10), 'Answer')
    ctx.status = 200
  },
)

router.post(
  '/:discussionId/answers/:answerId/comments',
  validateBodyMiddleware(commentsPostRequestSchema),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as CommentReqBody
    const input: CreateCommentInput = {
      targetId: ctx.params.answerId as number,
      targetType: 'Answer',
      comment: body.content,
    }
    const service = getDiscussionService(ctx)
    const result = await service.createComment(input)
    ctx.body = { id: result.id }
    ctx.status = 201
  },
)

router.put(
  '/:discussionId/answers/:answerId/comments/:commentId',
  validateBodyMiddleware(commentsPostRequestSchema),
  async (ctx: Api.Ctx) => {
    await handleCommentEdit(ctx, 'Answer')
  },
)

export { router }
