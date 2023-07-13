import { user } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import { defaultMiddlewares } from '../server/middleware'
import { pickOpsCtx } from '../utils/pick-ops-ctx'


// Routes with /users prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.get(
  '/active',
  async ctx => {
    const userService = new user.UserService(pickOpsCtx(ctx))
    const res = await userService.listActiveUserNames()
    ctx.body = res
    ctx.status = 200
  }
)

router.get(
  '/government',
  async ctx => {
    const userService = new user.UserService(pickOpsCtx(ctx))
    const res = await userService.listGovernmentUserNames()
    ctx.body = res
    ctx.status = 200
  }
)

export { router }
