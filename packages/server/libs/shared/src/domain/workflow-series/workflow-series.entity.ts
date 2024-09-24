import {
  Collection,
  Entity,
  Ref,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { WorkflowSeriesProperty } from '@shared/domain/property/workflow-series-property.entity'
import { User } from '@shared/domain/user/user.entity'
import { ScopedEntity } from '@shared/database/scoped.entity'

@Entity({ tableName: 'workflow_series' })
export class WorkflowSeries extends ScopedEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  name: string

  @Property()
  latestRevisionWorkflowId: number

  @Property()
  featured: boolean

  @Property()
  deleted: boolean

  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: Ref<User>

  @OneToMany({
    entity: () => WorkflowSeriesProperty,
    mappedBy: 'workflowSeries',
    orphanRemoval: true,
  })
  properties = new Collection<WorkflowSeriesProperty>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
