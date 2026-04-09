import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AppSeries } from './app-series.entity'
import { AppSeriesCountService } from './app-series-count.service'
import { AppSeriesScopeFilterProvider } from './app-series-scope-filter.provider'
import { AppSeriesService } from './service/app-series.service'

@Module({
  imports: [MikroOrmModule.forFeature([AppSeries])],
  providers: [AppSeriesScopeFilterProvider, AppSeriesCountService, AppSeriesService],
  exports: [AppSeriesService],
})
export class AppSeriesModule {}
