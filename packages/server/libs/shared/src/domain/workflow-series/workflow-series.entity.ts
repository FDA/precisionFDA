import { Collection, Entity, ManyToOne, OneToMany, Property, Ref, Reference } from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { WorkflowSeriesProperty } from '@shared/domain/property/workflow-series-property.entity'
import { WorkflowSeriesTagging } from '@shared/domain/tagging/workflow-series-tagging.entity'
import { User } from '@shared/domain/user/user.entity'

@Entity({ tableName: 'workflow_series' })
export class WorkflowSeries extends ScopedEntity {
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

  @OneToMany(
    () => WorkflowSeriesTagging,
    tagging => tagging.workflowSeries,
    {
      orphanRemoval: true,
    },
  )
  taggings = new Collection<WorkflowSeriesTagging>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
