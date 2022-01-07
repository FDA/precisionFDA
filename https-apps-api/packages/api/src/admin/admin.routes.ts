import type { JSONSchema7 } from 'json-schema'
import { queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'


// Routes with /admin prefix
const router = new Router<DefaultState, Api.Ctx>()

router.get(
  '/checkStaleJobs',
  async ctx => {
    const res = await queue.createCheckStaleJobsTask(ctx.user)
    ctx.body = res
    ctx.status = 200
  },
)

export { router }
