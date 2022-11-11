import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { App, User } from '..'
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

  @Property()
  name?: string

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

  @ManyToOne({ entity: () => App, fieldName: 'app_dxid' })
  app!: IdentifiedReference<App>

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: IdentifiedReference<User>

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
