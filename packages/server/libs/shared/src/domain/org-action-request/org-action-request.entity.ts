import { Entity, Enum, ManyToOne, PrimaryKey, Property, Ref } from '@mikro-orm/core'
import { Organization } from '@shared/domain/org/organization.entity'
import { User } from '@shared/domain/user/user.entity'
import { OrgActionRequestState } from './org-action-request-state.enum'
import { OrgActionRequestType } from './org-action-request-type.enum'
import { OrgActionRequestRepository } from './org-action-request.repository'

@Entity({ tableName: 'org_action_requests', repository: () => OrgActionRequestRepository })
export class OrgActionRequest {
  @PrimaryKey()
  id!: number

  @ManyToOne({ fieldName: 'org_id', entity: () => Organization })
  org!: Ref<Organization>

  @ManyToOne({ fieldName: 'initiator_id', entity: () => User })
  initiator!: Ref<User>

  @Enum()
  actionType!: OrgActionRequestType

  @Enum()
  state!: OrgActionRequestState

  @ManyToOne({ fieldName: 'member_id', entity: () => User, nullable: true })
  member?: Ref<User>

  @Property()
  createdAt: Date = new Date()

  @ManyToOne({ fieldName: 'approver_id', entity: () => User, nullable: true })
  approver?: Ref<User>

  @Property({ nullable: true })
  approvedAt?: Date

  @Property({ nullable: true })
  resolvedAt?: Date

  @Property({ type: 'text', nullable: true })
  info?: string
}
