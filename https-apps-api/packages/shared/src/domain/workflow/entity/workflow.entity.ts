import { Entity, IdentifiedReference, JsonType, ManyToOne, PrimaryKey, Property, Reference } from '@mikro-orm/core'
import { BaseEntity } from '../../../database/base-entity'
import { User } from '../../user'
import { WorkflowSpec } from '../model/workflow-spec'

@Entity({ tableName: 'workflows' })
export class Workflow extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  title: string

  @Property()
  name: string

  @Property()
  revision: number

  @Property()
  readme: string

  @Property()
  scope: string

  @Property()
  uid: string

  @Property()
  editVersion: number

  @Property({ type: JsonType })
  spec: WorkflowSpec

  // TODO: Add missing when needed - there is more in DB

  // references
  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
