import {
  Collection,
  Entity,
  Ref,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { App, User, UserFile } from '..'
import { BaseEntity } from '../../database/base-entity'

enum COMPARISON_STATE {
  DONE = 'done',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity({ tableName: 'comparisons' })
class Comparison extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property({nullable: false})
  name: string

  @Property()
  description?: string

  @Property()
  state?: COMPARISON_STATE

  @Property()
  dxjobid?: string

  @Property()
  project?: string

  @Property()
  scope?: string

  @Property()
  run_input?: string

  @Property()
  meta?: string

  @ManyToMany({
    pivotTable: 'comparison_inputs',
    joinColumn: 'comparison_id',
    inverseJoinColumn: 'user_file_id',
  })
  inputFiles = new Collection<UserFile>(this)

  @ManyToOne({ entity: () => App, fieldName: 'app_dxid', nullable: false })
  app: Ref<App>

  @ManyToOne({ entity: () => User, fieldName: 'user_id', nullable: false })
  user: Ref<User>

  // TODO: Add rest of the references in comparison.rb

  constructor(user: User, app: App) {
    super()
    this.user = Reference.create(user)
    this.app = Reference.create(app)
  }
}

export {
  COMPARISON_STATE,
  Comparison,
}
