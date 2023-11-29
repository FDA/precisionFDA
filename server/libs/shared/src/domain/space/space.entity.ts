import { Collection, Entity, EntityRepositoryType, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { SpaceMembership, User } from '..'
import { BaseEntity } from '../../database/base-entity'
import { SPACE_MEMBERSHIP_SIDE } from '../space-membership/space-membership.enum'
import { SPACE_STATE, SPACE_TYPE } from './space.enum'
import { getScopeFromSpaceId } from './space.helper'
import { SpaceRepository } from './space.repository'

@Entity({ tableName: 'spaces', customRepository: () => SpaceRepository })
export class Space extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  description: string

  @Property({ fieldName: 'host_dxorg' })
  hostDxOrg: string

  @Property({ fieldName: 'guest_dxorg' })
  guestDxOrg: string

  @Property({ fieldName: 'host_project', nullable: true })
  hostProject: string

  @Property({ fieldName: 'guest_project', nullable: true })
  guestProject: string

  @Property()
  state: SPACE_STATE

  @Property({ fieldName: 'space_type' })
  type: SPACE_TYPE

  @Property({fieldName: 'space_id', nullable: true })
  spaceId: number

  @Property()
  sponsorOrgId: number

  @Property()
  meta?: string

  @Property()
  restrictToTemplate?: boolean

  @Property()
  protected?: boolean

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @Property({ persist: false })
  get uid(): string {
    return getScopeFromSpaceId(this.id)
  }

  @Property({ persist: false })
  get scope() {
    return `space-${this.id}` as const
  }

  isConfidential(): boolean {
    return this.spaceId !== null
  }

  isConfidentialReviewerSpace() {
    return this.isConfidential() && this.hostDxOrg !== null
  }

  isConfidentialSponsorSpace() {
    return this.isConfidential() && this.guestDxOrg !== null
  }

  [EntityRepositoryType]?: SpaceRepository

  async findLeadBySide(side: SPACE_MEMBERSHIP_SIDE): Promise<User | undefined> {
    await this.spaceMemberships.init()
    const result = this.spaceMemberships.getItems().find(x => {
      return x.isLead() && x.side === side
    })
    await result?.user.load()
    return result?.user.getEntity()
  }

  async findHostLead(): Promise<User | undefined> {
    return await this.findLeadBySide(SPACE_MEMBERSHIP_SIDE.HOST)
  }

  async findGuestLead(): Promise<User | undefined> {
    return await this.findLeadBySide(SPACE_MEMBERSHIP_SIDE.GUEST)
  }
}
