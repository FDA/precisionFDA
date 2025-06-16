import { config } from '@shared/config'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { STATUS_CODES } from 'http'
import { nanoid } from 'nanoid'
import { Params } from 'nestjs-pino/params'
import pino from 'pino'

let customOptions = {}
const ignores = ['hostname']

if (config.logs.maskSensitive) {
  ignores.push(
    'req.headers.cookie',
    'req.headers.x-csrf-token',
    'res.headers.set-cookie',
    'req.headers.authorization',
  )
}

if (!config.logs.pretty) {
  ignores.push('time', 'pid', 'level')
  customOptions = {
    singleLine: true,
    messageFormat: '[{time} #{pid}] {levelLabel}: {msg}',
  }
}

export const pinoConfig: Params = {
  pinoHttp: {
    transport: {
      target: 'pino-pretty',
      options: {
        ignore: ignores.join(','),
        ...customOptions,
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    level: config.logs.level,
    formatters: {
      log(obj) {
        return {
          ...obj,
          userId: obj.userId || userContextStorage.getStore()?.id || 'unknown',
          requestId: userContextStorage.getStore()?.requestId || 'unknown',
        }
      },
    },
    customSuccessMessage: (req, res, responseTime) => {
      const statusCode = res.statusCode
      const statusText = STATUS_CODES[statusCode] || ''
      return `Completed ${res.statusCode} ${statusText} in ${responseTime}ms. RequestId: ${req.id}`
    },
    genReqId: () => nanoid(),
    serializers: {
      error: pino.stdSerializers.err,
    },
  },
}
