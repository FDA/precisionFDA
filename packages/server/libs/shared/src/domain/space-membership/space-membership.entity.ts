import { Collection, Entity, Enum, ManyToMany, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from './space-membership.enum'

@Entity({ tableName: 'space_memberships', repository: () => SpaceMembershipRepository })
export class SpaceMembership extends BaseEntity {
  @Property()
  active: boolean

  @Enum({ items: () => SPACE_MEMBERSHIP_SIDE, nullable: false })
  side: SPACE_MEMBERSHIP_SIDE

  @Enum({ items: () => SPACE_MEMBERSHIP_ROLE, nullable: false })
  role: SPACE_MEMBERSHIP_ROLE

  @ManyToOne(() => User)
  user!: Ref<User>

  @ManyToMany(
    () => Space,
    space => space.spaceMemberships,
  )
  spaces = new Collection<Space>(this)

  constructor(user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE, role: SPACE_MEMBERSHIP_ROLE) {
    super()
    this.user = Reference.create(user)
    this.spaces.add(space)
    this.active = true
    this.side = side
    this.role = role
  }

  isHost(): boolean {
    return this.side === SPACE_MEMBERSHIP_SIDE.HOST
  }

  isGuest(): boolean {
    return this.side === SPACE_MEMBERSHIP_SIDE.GUEST
  }

  isLead(): boolean {
    return this.role === SPACE_MEMBERSHIP_ROLE.LEAD
  }

  isAdmin(): boolean {
    return this.role === SPACE_MEMBERSHIP_ROLE.ADMIN
  }

  isAdminOrLead(): boolean {
    return [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(this.role)
  }

  isContributor(): boolean {
    return this.role === SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR
  }

  getSpaceMembershipSideAlias(): string {
    switch (this.side) {
      case SPACE_MEMBERSHIP_SIDE.HOST:
        return 'reviewer'
      case SPACE_MEMBERSHIP_SIDE.GUEST:
        return 'sponsor'
      default:
        return null
    }
  }

  getSpaceMembershipRoleAlias(): string {
    switch (this.role) {
      case SPACE_MEMBERSHIP_ROLE.ADMIN:
        return 'Administrator'
      case SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR:
        return 'Contributor'
      case SPACE_MEMBERSHIP_ROLE.VIEWER:
        return 'Viewer'
      case SPACE_MEMBERSHIP_ROLE.LEAD:
        return 'Lead'
      default:
        return null
    }
  }
}
