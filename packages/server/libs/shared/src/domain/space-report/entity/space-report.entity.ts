import {
  Collection,
  Entity,
  EntityRepositoryType,
  JsonType,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base-entity'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-options.map'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportRepository } from '@shared/domain/space-report/repository/space-report.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { EntityScope } from '@shared/types/common'
import { SpaceReportState } from '../model/space-report-state.type'
import { SpaceReportPart } from './space-report-part.entity'

@Entity({ tableName: 'space_reports', repository: () => SpaceReportRepository })
export class SpaceReport<T extends SpaceReportFormat = SpaceReportFormat> extends BaseEntity {
  @Property()
  scope: EntityScope

  @OneToOne({ entity: () => UserFile, fieldName: 'result_file_id' })
  resultFile: Ref<UserFile>

  @Property()
  state: SpaceReportState = 'CREATED'

  @Property()
  format: T

  @Property({ type: JsonType })
  options: SpaceReportFormatToOptionsMap[T]

  @OneToMany(() => SpaceReportPart, 'spaceReport')
  reportParts = new Collection<SpaceReportPart<SpaceReportPartSourceType, T>>(this)

  @ManyToOne({ entity: () => User, fieldName: 'created_by' })
  createdBy: Ref<User>;

  [EntityRepositoryType]?: SpaceReportRepository

  constructor(createdBy: User) {
    super()
    this.createdBy = Reference.create(createdBy)
  }
}
