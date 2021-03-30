import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { SpaceMembership } from '..'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'spaces' })
export class Space extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  title: string

  @ManyToMany(() => SpaceMembership, 'spaces', {
    pivotTable: 'space_memberships_spaces',
    owner: true,
  })
  spaceMemberships = new Collection<SpaceMembership>(this)
}
