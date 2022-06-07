import { DefaultState } from 'koa'
import Router from 'koa-router'
import { queue } from '@pfda/https-apps-shared'
import { defaultMiddlewares } from '../server/middleware';


// Routes with /users prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares);

router.get(
  '/checkup',
  async ctx => {
    const res = await queue.createUserCheckupTask({
      type: queue.types.TASK_TYPE.USER_CHECKUP,
      user: ctx.user })
    ctx.body = res
  },
)

export { router }
