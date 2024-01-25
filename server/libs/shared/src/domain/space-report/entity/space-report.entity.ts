import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../../database/base-entity'
import { SpaceReportState } from '../model/space-report-state.type'
import { SpaceReportPart } from './space-report-part.entity'

@Entity({ tableName: 'space_reports' })
export class SpaceReport extends BaseEntity {
  @ManyToOne()
  space: Space

  @OneToOne({ entity: () => UserFile, fieldName: 'result_file_id' })
  resultFile: Ref<UserFile>

  @Property()
  state: SpaceReportState = 'CREATED'

  @OneToMany(() => SpaceReportPart, 'spaceReport')
  reportParts = new Collection<SpaceReportPart>(this)

  @ManyToOne({ entity: () => User, fieldName: 'created_by' })
  createdBy: Ref<User>

  constructor(createdBy: User) {
    super()
    this.createdBy = Reference.create(createdBy)
  }
}
