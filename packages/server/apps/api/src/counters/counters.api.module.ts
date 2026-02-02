import { Module } from '@nestjs/common'
import { CountersController } from './counters.controller'
import { CountersFacadeModule } from '@shared/facade/counters/counters-facade.module'

@Module({
  imports: [CountersFacadeModule],
  controllers: [CountersController],
})
export class CountersApiModule {}
