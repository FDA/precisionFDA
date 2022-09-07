import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { SpaceMembership } from '..'
import { BaseEntity } from '../../database/base-entity'
import { SPACE_TYPE } from './space.enum'
import { getScopeFromSpaceId } from './space.helper'
@Entity({ tableName: 'spaces' })
export class Space extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  title: string

  @Property({ fieldName: 'host_dxorg'})
  hostDxOrg: string

  @Property({ fieldName: 'guest_dxorg'})
  guestDxOrg: string

  @Property()
  state: number

  @Property({ fieldName: 'space_type' })
  type: SPACE_TYPE

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @Property({ persist: false })
  get uid(): string {
    return getScopeFromSpaceId(this.id)
  }
}
