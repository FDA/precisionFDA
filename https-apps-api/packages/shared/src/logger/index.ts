import pino from 'pino'
import { config } from '../config'

const getLogger = (name = 'pino-logger-name'): pino.Logger =>
  pino({
    name,
    prettyPrint: config.logs.pretty,
    level: config.logs.level,
    // todo: serializers
  })

const defaultLogger = getLogger()

export { getLogger, defaultLogger }
