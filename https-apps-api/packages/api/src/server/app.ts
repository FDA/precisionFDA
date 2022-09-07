import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import { errorHandlerMdw } from './middleware/error-handler'
import { logRequestMdw } from './middleware/log-request'
import { ormContextMdw } from './middleware/orm-context'
import { parseUserContextMdw } from './middleware/user-context'
import { router } from './routes'

export function createApp() {
  const app = new Koa<Koa.DefaultState, Api.Ctx>()
  // todo: security, compression middlewares
  app.use(koaBody())
  app.use(logRequestMdw)
  app.use(errorHandlerMdw)
  app.use(ormContextMdw)
  app.use(parseUserContextMdw)

  // routes
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
