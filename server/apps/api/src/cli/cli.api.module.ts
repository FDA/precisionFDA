import { Module } from '@nestjs/common'
import { CliController } from './cli.controller'

@Module({
  controllers: [CliController],
})
export class CliApiModule {}
