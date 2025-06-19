import { Logger } from '@nestjs/common'

const getLogger = (name = 'pino-logger-name'): Logger => new Logger(name)

const defaultLogger = getLogger()

export { defaultLogger, getLogger }
