import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { App } from '@shared/domain/app/app.entity'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

enum COMPARISON_STATE {
  DONE = 'done',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity({ tableName: 'comparisons', repository: () => ComparisonRepository })
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [
      { user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE },
      { scope: { $in: args.spaceScopes } },
    ],
  }),
})
class Comparison extends ScopedEntity {
  @PrimaryKey()
  id: number

  @Property({ nullable: false })
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
  run_input?: string

  @Property()
  meta?: string

  @ManyToMany({
    entity: () => UserFile,
    pivotTable: 'comparison_inputs',
    joinColumn: 'comparison_id',
    inverseJoinColumn: 'user_file_id',
  })
  inputFiles = new Collection<UserFile>(this)

  @ManyToOne({ entity: () => App, fieldName: 'app_dxid', nullable: false })
  app: Ref<App>

  @ManyToOne({ entity: () => User, fieldName: 'user_id', nullable: false })
  user: Ref<User>

  isPublishable() {
    return this.state === COMPARISON_STATE.DONE
  }

  // TODO: Add rest of the references in comparison.rb

  [EntityRepositoryType]?: ComparisonRepository
  constructor(user: User, app: App) {
    super()
    this.user = Reference.create(user)
    this.app = Reference.create(app)
  }
}

export { Comparison, COMPARISON_STATE }
