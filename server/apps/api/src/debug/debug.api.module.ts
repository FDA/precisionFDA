import { Module } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DebugController } from './debug.controller'

@Module({
  controllers: [DebugController],
  providers: [UserContextGuard],
})
export class DebugApiModule {}
