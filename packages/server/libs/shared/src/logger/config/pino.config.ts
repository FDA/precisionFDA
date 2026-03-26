import { type IncomingMessage, type ServerResponse, STATUS_CODES } from 'node:http'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY } from '@shared/config/consts'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
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
    timestamp: pino.stdTimeFunctions.isoTime,
    level: config.logs.level,
    formatters: {
      log(obj: Record<string, unknown>): Record<string, unknown> {
        return {
          ...obj,
          userId: obj.userId || userContextStorage.getStore()?.id || 'unknown',
          requestId: userContextStorage.getStore()?.requestId || 'unknown',
        }
      },
    },
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse, responseTime: number) => {
      const statusCode = res.statusCode
      const statusText = STATUS_CODES[statusCode] || ''
      return `Completed ${res.statusCode} ${statusText} in ${responseTime}ms. RequestId: ${req.id}`
    },
    genReqId: () => nanoid(),
    serializers: {
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.wrapRequestSerializer(req => {
        const maskedRequest = { ...req, headers: { ...req.headers } }
        if (config.logs.maskSensitive) {
          if (maskedRequest.headers.cookie) {
            maskedRequest.headers.cookie = MASKED
          }
          if (maskedRequest.headers.authorization) {
            maskedRequest.headers.authorization = MASKED
          }
          if (maskedRequest.headers['x-csrf-token']) {
            maskedRequest.headers['x-csrf-token'] = MASKED
          }
        }
        return maskedRequest
      }),
      res: pino.stdSerializers.wrapResponseSerializer(res => {
        const headers = { ...res.headers }
        if (headers?.['set-cookie'] && config.logs.maskSensitive) {
          let setCookieValue = headers['set-cookie']
          if (Array.isArray(setCookieValue)) {
            setCookieValue = setCookieValue.join('; ')
          }
          const maskedCookies = setCookieValue.split(';').map((cookie: string) => {
            return cookie.trim().startsWith(COOKIE_SESSION_KEY) ? `${COOKIE_SESSION_KEY}=${MASKED}` : cookie.trim()
          })
          headers['set-cookie'] = maskedCookies.join('; ')
        }
        return {
          statusCode: res.statusCode,
          headers: headers,
        }
      }),
    },
  },
}
