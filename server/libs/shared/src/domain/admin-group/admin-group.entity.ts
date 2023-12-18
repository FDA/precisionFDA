import { Entity, Collection, OneToMany, Enum } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { AdminMembership } from '../admin-membership/admin-membership.entity'

export enum ADMIN_GROUP_ROLES {
  ROLE_SITE_ADMIN = 0,
  ROLE_REVIEW_SPACE_ADMIN = 1,
  ROLE_CHALLENGE_ADMIN = 2,
  ROLE_CHALLENGE_EVALUATOR = 3,
}

@Entity({ tableName: 'admin_groups' })
export class AdminGroup extends BaseEntity {
  @Enum()
  role: ADMIN_GROUP_ROLES

  @OneToMany(() => AdminMembership, 'adminGroup', { orphanRemoval: true })
  adminMemberships = new Collection<AdminMembership>(this)
}
