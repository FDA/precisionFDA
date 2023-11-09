import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../../database/base-entity'
import { Space } from '../../space'
import { User } from '../../user'
import { UserFile } from '../../user-file'
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
