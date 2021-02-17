import { nanoid } from 'nanoid'
import { log } from '../../logger'

export const makeLogRequestMdw: Api.Mdw = () => {
  const id = nanoid()
  const logger = log.child({ requestId: id })

  return async (ctx, next) => {
    // pass the log into koa context
    ctx.log = logger
    ctx.log.info(
      { req: { id, method: ctx.req.method, url: ctx.req.url, headers: ctx.req.headers } },
      'request started',
    )
    // eslint-disable-next-line callback-return
    await next()
    ctx.log.info({ statusCode: ctx.res.statusCode }, 'request finished')
  }
}
