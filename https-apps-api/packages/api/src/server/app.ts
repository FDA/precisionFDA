import Koa from 'koa'
import koaBody from 'koa-bodyparser'
import * as mdw from './middleware'
import { router } from './routes'

export function createApp() {
  const app = new Koa<Koa.DefaultState, Api.Ctx>()
  // todo: security, compression middlewares
  app.use(koaBody())
  app.use(mdw.makeLogRequestMdw())
  app.use(mdw.makeErrorHandlerMdw())
  app.use(mdw.makeOrmContextMdw())
  app.use(mdw.makeParseUserContextMdw())

  // routes
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
