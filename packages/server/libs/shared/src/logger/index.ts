import { Logger } from '@nestjs/common'

const getLogger: (name?: string) => Logger = (name: string = 'pino-logger-name'): Logger => new Logger(name)

const defaultLogger: Logger = getLogger()

export { defaultLogger, getLogger }
