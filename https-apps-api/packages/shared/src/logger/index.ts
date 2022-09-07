import pino from 'pino'
import { config } from '../config'

const getLogger = (name = 'pino-logger-name'): pino.Logger =>
  pino({
    name,
    prettyPrint: config.logs.pretty ? { translateTime: true } : false,
    level: config.logs.level,
    // todo: serializers
    serializers: {
      error: pino.stdSerializers.err
    },
  })

const defaultLogger = getLogger()

export { getLogger, defaultLogger }
