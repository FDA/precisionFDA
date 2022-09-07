import { nanoid } from 'nanoid'
import { utils } from '@pfda/https-apps-shared'
import { log } from '../../logger'

export const logRequestMdw = async (ctx: Api.Ctx, next) => {
  // TODO(samuel) - validate this change with Zai
  const id = nanoid()
  const logger = log.child({ requestId: id })
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
