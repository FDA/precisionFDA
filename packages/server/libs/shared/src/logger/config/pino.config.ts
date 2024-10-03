import { config } from '@shared/config'
import { COOKIE_SESSION_KEY } from '@shared/config/consts'
import { nanoid } from 'nanoid'
import { Params } from 'nestjs-pino/params'
import pino from 'pino'

const MASKED = '[masked]'

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
        if (config.logs.maskSensitive) {
          if (req.headers['cookie']) {
            req.headers['cookie'] = MASKED
          }
          if (req.headers['authorization']) {
            req.headers['authorization'] = MASKED
          }
        }
        return req
      }),
      res: pino.stdSerializers.wrapResponseSerializer((res) => {
        const headers = res.raw['headers']
        if (headers?.['set-cookie'] && config.logs.maskSensitive) {
          let setCookieValue = headers['set-cookie']
          if (Array.isArray(setCookieValue)) {
            setCookieValue = setCookieValue.join('; ')
          }
          const maskedCookies = setCookieValue.split(';').map((cookie: string) => {
            return cookie.trim().startsWith(COOKIE_SESSION_KEY)
              ? `${COOKIE_SESSION_KEY}=${MASKED}`
              : cookie.trim()
          })
          headers['set-cookie'] = maskedCookies.join('; ')
        }
        return {
          statusCode: res.raw.statusCode,
          headers: headers,
        }
      }),
    },
  },
}
