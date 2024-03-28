import { Module } from '@nestjs/common'
import { CliModule } from '@shared/domain/cli/cli.module'
import { CliController } from './cli.controller'

@Module({
  imports: [CliModule],
  controllers: [CliController],
})
export class CliApiModule {}
