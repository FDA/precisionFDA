import { queue } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import { defaultMiddlewares } from '../server/middleware'


// Routes with /account prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/checkSpacesPermissions',
  async ctx => {
    const res = await queue.createSyncSpacesPermissionsTask(ctx.user!)
    ctx.body = res
    ctx.status = 204
  },
)

router.get(
  '/checkup',
  async ctx => {
    const res = await queue.createUserCheckupTask({
      type: queue.types.TASK_TYPE.USER_CHECKUP,
      user: ctx.user!,
    })
    ctx.body = res
  },
)

export { router }
