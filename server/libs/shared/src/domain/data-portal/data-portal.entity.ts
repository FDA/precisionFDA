import {
  Collection,
  Entity,
  Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Space } from '@shared/domain/space/space.entity'
import { BaseEntity } from '../../database/base-entity'
import { DATA_PORTAL_STATUS } from './data-portal.enum'

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

  @Property()
  default: boolean

  @Enum()
  status: DATA_PORTAL_STATUS

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
