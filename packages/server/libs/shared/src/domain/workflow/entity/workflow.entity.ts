import { Entity, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '@shared/database/base.entity'
import { WorkflowSpec } from '../model/workflow-spec'
import WorkflowRepository from '@shared/domain/workflow/entity/workflow.repository'
import { WorkaroundJsonType } from '@shared/database/json-workaround.type'

@Entity({ tableName: 'workflows', repository: () => WorkflowRepository })
export class Workflow extends BaseEntity {
  @Property()
  dxid: DxId<'workflow'>

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
  uid: Uid<'workflow'>

  @Property()
  editVersion: number

  @Property({ type: WorkaroundJsonType })
  spec: WorkflowSpec

  // foreign keys -> not yet mapped
  @Property()
  workflowSeriesId: number

  // TODO: Add missing when needed - there is more in DB

  // references
  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: Ref<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
