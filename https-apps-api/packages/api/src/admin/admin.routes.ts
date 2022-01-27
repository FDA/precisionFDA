import type { JSONSchema7 } from 'json-schema'
import { queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import { defaultMiddlewares } from '../server/middleware'


// Routes with /admin prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares);

router.get(
  '/checkStaleJobs',
  async ctx => {
    const res = await queue.createCheckStaleJobsTask(ctx.user)
    ctx.body = res
    ctx.status = 200
  },
)

export { router }
