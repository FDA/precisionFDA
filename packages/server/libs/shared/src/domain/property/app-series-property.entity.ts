import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { GeneralProperty } from './property.entity'

@Entity({ discriminatorValue: 'appSeries' })
export class AppSeriesProperty extends GeneralProperty {
  @ManyToOne(() => AppSeries, { joinColumn: 'target_id' })
  appSeries: Ref<AppSeries>
}
