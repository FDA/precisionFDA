import { Global, Logger, Module } from '@nestjs/common'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import { pinoConfig } from '@shared/logger/config/pino.config'
import { getLogger } from '@shared/logger/index'

@Global()
@Module({
  imports: [PinoLoggerModule.forRoot(pinoConfig)],
  providers: [
    {
      provide: Logger,
      useFactory: (): Logger => getLogger(),
    },
  ],
  exports: [Logger],
})
export class LoggerModule {}
