import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceGroupRepository } from '@shared/domain/space/space-group.repository'

@Entity({ tableName: 'space_groups', repository: () => SpaceGroupRepository })
export class SpaceGroup extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  description: string

  @ManyToMany({
    entity: () => Space,
    pivotTable: 'space_group_spaces',
    joinColumn: 'space_group_id',
    inverseJoinColumn: 'space_id',
  })
  spaces = new Collection<Space>(this)
}
