import { Entity, JsonType, ManyToOne, Property, Ref } from '@mikro-orm/core'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { BaseEntity } from '@shared/database/base-entity'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'
import { SpaceReportPartState } from '../model/space-report-part-state.type'
import { SpaceReport } from './space-report.entity'

@Entity({ tableName: 'space_report_parts' })
export class SpaceReportPart<
  T extends SpaceReportPartSourceType = SpaceReportPartSourceType,
  F extends SpaceReportFormat = SpaceReportFormat,
> extends BaseEntity {
  @ManyToOne({ entity: () => SpaceReport, fieldName: 'space_report_id' })
  spaceReport: Ref<SpaceReport>

  @Property()
  sourceId: number

  @Property()
  sourceType: T

  @Property()
  state: SpaceReportPartState = 'CREATED'

  @Property({ type: JsonType })
  result: SpaceReportPartResult<T, F>
}
