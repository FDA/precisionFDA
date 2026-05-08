import { Entity, ManyToOne, Ref, Reference, Unique } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { AdminGroup } from '../admin-group/admin-group.entity'
import { AdminMembershipRepository } from './admin-membership.repository'

@Entity({ tableName: 'admin_memberships', repository: () => AdminMembershipRepository })
@Unique({ properties: ['user', 'adminGroup'] })
export class AdminMembership extends BaseEntity {
  @ManyToOne(() => User)
  user: Ref<User>

  @ManyToOne(() => AdminGroup)
  adminGroup: Ref<AdminGroup>

  constructor(user: User, adminGroup: AdminGroup) {
    super()
    this.user = Reference.create(user)
    this.adminGroup = Reference.create(adminGroup)
  }
}
