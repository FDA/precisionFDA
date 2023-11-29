import pino from 'pino'
import { config } from '../config'

const getLogger = (name = 'pino-logger-name'): pino.Logger =>
  pino({
    name,
    transport: config.logs.pretty ? {
      target: 'pino-pretty',
      options: {
        translateTime: true,
      }
    } : undefined,
    level: config.logs.level,
    // todo: serializers
    serializers: {
      error: pino.stdSerializers.err
    },
  })

const defaultLogger = getLogger()

export { getLogger, defaultLogger }
