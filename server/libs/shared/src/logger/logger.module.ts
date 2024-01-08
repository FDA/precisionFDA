import { Global, Logger, Module } from '@nestjs/common'
import { pinoConfig } from '@shared/logger/config/pino.config'
import { getLogger } from '@shared/logger/index'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

@Global()
@Module({
  imports: [PinoLoggerModule.forRoot(pinoConfig)],
  providers: [
    {
      provide: Logger,
      useFactory: () => getLogger(),
    },
  ],
  exports: [Logger],
})
export class LoggerModule {}
