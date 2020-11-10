import pinoHttp from 'pino-http'
import { nanoid } from 'nanoid'
import { log } from '../../logger'

export const makeLogRequestMdw: Api.Mdw = () => {
  const id = nanoid()
  const logHttp = pinoHttp({
    logger: log,
    genReqId: () => id,
    serializers: {
      req(req) {
        return { id: req.id }
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        }
      },
    },
  })

  return (ctx, next) => {
    // wrap the request
    logHttp(ctx.req, ctx.res)
    log.info(
      { req: { id, method: ctx.req.method, url: ctx.req.url, headers: ctx.req.headers } },
      'request started',
    )
    // pass the log into koa context
    ctx.log = ctx.req.log
    return next()
  }
}
