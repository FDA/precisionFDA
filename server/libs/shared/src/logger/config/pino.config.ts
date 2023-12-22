import { config } from '@shared'
import { maskAccessTokenUserCtx } from '@shared/utils'
import { nanoid } from 'nanoid'
import { Params } from 'nestjs-pino/params'
import pino from 'pino'

export const pinoConfig: Params = {
  pinoHttp: {
    transport: config.logs.pretty
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: true,
          },
        }
      : undefined,
    level: config.logs.level,
    genReqId: () => nanoid(),
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.wrapRequestSerializer((req) => {
        req.headers = maskAccessTokenUserCtx(req.headers)
        return req
      }),
    },
  },
}
