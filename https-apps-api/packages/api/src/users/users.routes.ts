import { DefaultState } from 'koa'
import Router from 'koa-router'
import { defaultMiddlewares } from '../server/middleware';


// Routes with /users prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares);

export { router }
