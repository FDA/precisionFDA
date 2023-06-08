import { Collection, Entity, EntityRepositoryType, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { SpaceMembership } from '..'
import { BaseEntity } from '../../database/base-entity'
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
  meta: string

  @Property()
  protected: boolean

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @Property({ persist: false })
  get uid(): string {
    return getScopeFromSpaceId(this.id)
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
}
