import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.APP_SERIES })
export class AppSeriesTagging extends Tagging {
  @ManyToOne(() => AppSeries, { joinColumn: 'taggable_id' })
  appSeries: Ref<AppSeries>
}
