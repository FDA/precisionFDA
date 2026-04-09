import { Collection, Entity, Filter, ManyToMany, ManyToOne, OneToMany, Property, Ref, Reference } from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { App } from '@shared/domain/app/app.entity'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { ComparisonTagging } from '@shared/domain/tagging/comparison-tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { DxId } from '../entity/domain/dxid'

enum COMPARISON_STATE {
  DONE = 'done',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity({ tableName: 'comparisons', repository: () => ComparisonRepository })
@Filter({
  name: 'accessibleBy',
  cond: args => ({
    $or: [{ user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE }, { scope: { $in: args.spaceScopes } }],
  }),
})
class Comparison extends ScopedEntity {
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

  @Property({ fieldName: 'app_dxid' })
  appDxid: DxId<'app'>

  @ManyToOne({ entity: () => User, fieldName: 'user_id', nullable: false })
  user: Ref<User>

  @OneToMany(
    () => ComparisonTagging,
    tagging => tagging.comparison,
    { orphanRemoval: true },
  )
  taggings = new Collection<ComparisonTagging>(this)

  isPublishable(): boolean {
    return this.state === COMPARISON_STATE.DONE
  }

  constructor(user: User, app: App) {
    super()
    this.user = Reference.create(user)
    this.appDxid = app.dxid
  }
}

export { COMPARISON_STATE, Comparison }
