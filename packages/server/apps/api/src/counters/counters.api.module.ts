import { Module } from '@nestjs/common'
import { CountersFacadeModule } from '@shared/facade/counters/counters-facade.module'
import { CountersController } from './counters.controller'

@Module({
  imports: [CountersFacadeModule],
  controllers: [CountersController],
})
export class CountersApiModule {}
