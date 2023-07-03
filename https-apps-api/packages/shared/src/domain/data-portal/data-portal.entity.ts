import {
  Collection,
  Entity, Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property, Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { STATUS } from './data-portal.enum'
import { Space } from '../space'
import { Resource } from '../resource'

@Entity({ tableName: 'data_portals' })
class DataPortal extends BaseEntity {

  @Property()
  name: string

  @Property()
  description: string

  @Property()
  content: string

  @Property()
  editorState: string

  @Property()
  cardImageUrl: string

  @Property()
  cardImageId: string

  @Property()
  sortOrder: number

  @Enum()
  status: STATUS

  @ManyToOne(() => Space)
  space!: IdentifiedReference<Space>

  @OneToMany(() => Resource, resource => resource.dataPortal)
  resources = new Collection<Resource>(this)

  constructor(space: Space) {
    super()
    this.space = Reference.create(space)
  }

}

export { DataPortal }
