import { Entity, JsonType, ManyToOne, Property, Ref } from '@mikro-orm/core'
import { BaseEntity } from '../../../database/base-entity'
import { SpaceReportPartResult } from '../model/space-report-part-result'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'
import { SpaceReportPartState } from '../model/space-report-part-state.type'
import { SpaceReport } from './space-report.entity'

@Entity({ tableName: 'space_report_parts' })
export class SpaceReportPart extends BaseEntity {
  @ManyToOne({ entity: () => SpaceReport, fieldName: 'space_report_id' })
  spaceReport: Ref<SpaceReport>

  @Property()
  sourceId: number

  @Property()
  sourceType: SpaceReportPartSourceType

  @Property()
  state: SpaceReportPartState = 'CREATED'

  @Property({ type: JsonType })
  result: SpaceReportPartResult
}
