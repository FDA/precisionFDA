import { config, debug, queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import type { JSONSchema7 } from 'json-schema'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'

interface IRemoveRepeatableParams {
  key: string
}

const router = new Router<DefaultState, Api.Ctx>()

if (!config.devFlags.middleware.skipUserMiddlewareForDebugRoutes) {
  router.use(defaultMiddlewares)
}

// Debugging bull queue
router.get(
  '/queue',
  async ctx => {
    const res = await queue.debug.debugQueueJobs()
    ctx.body = res
    ctx.status = 200
  },
)

router.get(
  '/queue/cleanup',
  async ctx => {
    const res = await new queue.CleanupWorkerQueueOperation(ctx).execute()
    ctx.body = res
    ctx.status = 200
  },
)

router.get(
  '/queue/job/:bullJobId',
  async ctx => {
    const res = await queue.debug.debugQueueJob(ctx.params.bullJobId)
    ctx.body = res
    ctx.status = 200
  },
)

router.delete(
  '/queue/removeJobs/:pattern',
  async ctx => {
    const res = await queue.debug.removeJobs(ctx.params.pattern)
    ctx.body = res
    ctx.status = 200
  },
)

const removeRepeatableSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
  },
}

router.delete(
  '/queue/removeRepeatable',
  makeSchemaValidationMdw({ body: removeRepeatableSchema }),
  async (ctx: Api.Ctx) => {
    const { key } = ctx.request.body as IRemoveRepeatableParams
    const res = await queue.debug.removeRepeatable(key)
    ctx.body = res
    ctx.status = 200
  },
)

// Debugging exception capturing and memory
if (config.api.allowErrorTestingRoutes) {
  router.get(
    '/errors/throwApiException',
    async ctx => {
      const err = new Error('This is a test error')
      throw err
    },
  )

  router.get(
    '/errors/testApiMemoryAllocationError',
    async ctx => {
      debug.testHeapMemoryAllocationError()
      ctx.body = { result: 'Test api heap memory allocation test finished - did not crash?' }
      ctx.status = 200
    },
  )

  router.get(
    '/errors/testWorkerMemoryAllocationError',
    async ctx => {
      queue.createTestMaxMemoryTask()
      ctx.body = { result: 'Test worker heap memory allocation test queued' }
      ctx.status = 200
    },
  )
}

export { router }
