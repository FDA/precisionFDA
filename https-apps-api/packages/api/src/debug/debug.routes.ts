import { queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { makeValidationMdw } from '../server/middleware'

const router = new Router<DefaultState, Api.Ctx>()


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
  '/queue/job/:bullJobId',
  async ctx => {
    const res = await queue.debug.debugQueueJob(ctx.params.bullJobId)
    ctx.body = res
    ctx.status = 200
  },
)

router.get(
  '/queue/removeJobs/:pattern',
  async ctx => {
    const res = await queue.debug.removeJobs(ctx.params.pattern)
    ctx.body = res
    ctx.status = 200
  }
)

const removeRepeatableSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
  },
  required: ['id'],
  additionalProperties: true,
}

router.get(
  '/queue/removeRepeatable',
  makeValidationMdw({ query: removeRepeatableSchema }),
  async ctx => {
    const res = await queue.debug.removeRepeatable(ctx.validatedQuery.key)
    ctx.body = res
    ctx.status = 200
  }
)

export { router }
