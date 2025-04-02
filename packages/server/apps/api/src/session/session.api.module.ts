import { Module } from '@nestjs/common'
import { SessionController } from './session.controller'

@Module({
  controllers: [SessionController],
})
export class SessionApiModule {}
