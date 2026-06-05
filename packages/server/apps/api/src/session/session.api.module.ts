import { Module } from '@nestjs/common'
import { CsrfTokenController } from './csrf-token.controller'
import { SessionController } from './session.controller'

@Module({
  controllers: [SessionController, CsrfTokenController],
})
export class SessionApiModule {}
