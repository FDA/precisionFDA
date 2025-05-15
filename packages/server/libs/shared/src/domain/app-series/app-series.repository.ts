import { EntityRepository } from '@mikro-orm/mysql'
import { AppSeries } from './app-series.entity'

export class AppSeriesRepository extends EntityRepository<AppSeries> {}
