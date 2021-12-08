import { queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'

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

export { router }
