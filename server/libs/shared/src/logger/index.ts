import { Logger } from '@nestjs/common'

const getLogger = (name = 'pino-logger-name') => new Logger(name)

const defaultLogger = getLogger()

export { getLogger, defaultLogger }
