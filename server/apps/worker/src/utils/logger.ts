import { Logger, Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { pinoConfig } from '@shared/logger/config/pino.config'
import { Logger as PinoLogger } from 'nestjs-pino'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino/LoggerModule'

// TODO(PFDA-4833) - remove this temporary workaround for a unified logger provider
@Module({
  imports: [PinoLoggerModule.forRoot(pinoConfig)],
  providers: [
    {
      provide: 'LOGGER_PROVIDER',
      useValue: (name?: string) => new Logger(name),
    },
  ],
})
class LoggerModule {}

let loggerProvider: (name?: string) => Logger
// todo: should have added message about this is a worker
let log: Logger

const getChildLogger = (requestId: string) => loggerProvider(requestId)

async function initLogger() {
  const app = await NestFactory.createApplicationContext(LoggerModule)

  app.useLogger(app.get(PinoLogger))

  loggerProvider = app.get('LOGGER_PROVIDER')
  log = loggerProvider()
}

export { log, getChildLogger, initLogger }
