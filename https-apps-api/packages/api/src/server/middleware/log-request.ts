import { nanoid } from 'nanoid'
import { log } from '../../logger'
import { utils } from '@pfda/https-apps-shared'

export const makeLogRequestMdw: Api.Mdw = () => {
  const id = nanoid()
  const logger = log.child({ requestId: id })

  return async (ctx, next) => {
    // pass the log into koa context
    ctx.log = logger
    ctx.log.info(
      {
        req: {
          id,
          method: ctx.req.method,
          host: ctx.request.hostname,
          path: ctx.request.path,
          query: utils.maskAccessTokenUserCtx(ctx.request.query),
          headers: ctx.req.headers,
        },
      },
      'request started',
    )
    // eslint-disable-next-line callback-return
    await next()
    ctx.log.info({ statusCode: ctx.res.statusCode }, 'request finished')
  }
}
