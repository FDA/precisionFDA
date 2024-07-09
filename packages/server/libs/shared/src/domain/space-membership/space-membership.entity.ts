import {
  Collection,
  Entity,
  Ref,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { isNil } from 'ramda'
import { BaseEntity } from '../../database/base-entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from './space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'

@Entity({ tableName: 'space_memberships', repository: () => SpaceMembershipRepository })
export class SpaceMembership extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  active: boolean

  @Property()
  side: SPACE_MEMBERSHIP_SIDE

  @Property()
  role: SPACE_MEMBERSHIP_ROLE

  @ManyToOne(() => User)
  user!: Ref<User>

  @ManyToMany(() => Space, (space) => space.spaceMemberships)
  spaces = new Collection<Space>(this)

  constructor(user: User, space?: Space) {
    super()
    this.user = Reference.create(user)
    if (!isNil(space)) {
      this.spaces.add(space)
    }
  }

  isHost() {
    return this.side === SPACE_MEMBERSHIP_SIDE.HOST
  }

  isGuest() {
    return this.side === SPACE_MEMBERSHIP_SIDE.GUEST
  }

  isLead() {
    return this.role === SPACE_MEMBERSHIP_ROLE.LEAD
  }

  isAdmin() {
    return this.role === SPACE_MEMBERSHIP_ROLE.ADMIN
  }

  isAdminOrLead() {
    return [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(this.role)
  }

  isContributor() {
    return this.role === SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR
  }
}
