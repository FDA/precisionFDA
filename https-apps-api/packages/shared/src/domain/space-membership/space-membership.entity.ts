import {
  Collection,
  Entity,
  IdentifiedReference,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Space, User } from '..'
import { BaseEntity } from '../../database/base-entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from './space-membership.enum'

@Entity({ tableName: 'space_memberships' })
export class SpaceMembership extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  active: boolean

  @Property()
  side: SPACE_MEMBERSHIP_SIDE

  @Property()
  role: SPACE_MEMBERSHIP_ROLE

  @ManyToOne()
  user!: IdentifiedReference<User>

  @ManyToMany(() => Space, space => space.spaceMemberships)
  spaces = new Collection<Space>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
