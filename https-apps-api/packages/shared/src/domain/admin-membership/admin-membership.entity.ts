// note(samuel): manually created pivot table, as mikro-orm ManyToMany relation doesn't extend BaseEntity

import { Entity, ManyToOne, IdentifiedReference, Reference, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '..'
import { AdminGroup } from '../admin-group/admin-group.entity'

@Entity({ tableName: 'admin_memberships' })
@Unique({ properties: ['user', 'adminGroup'] })
export class AdminMembership extends BaseEntity {
  @Unique()
  @ManyToOne(() => User)
  user: IdentifiedReference<User>

  @Unique()
  @ManyToOne(() => AdminGroup)
  adminGroup: IdentifiedReference<AdminGroup>

  constructor(user: User, adminGroup: AdminGroup) {
    super()
    this.user = Reference.create(user)
    this.adminGroup = Reference.create(adminGroup)
  }
}
