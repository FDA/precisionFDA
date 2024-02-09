import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { BaseEntity } from '../../database/base-entity'
import { DATA_PORTAL_STATUS } from './data-portal.enum'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'

@Entity({ tableName: 'data_portals', customRepository: () => DataPortalRepository })
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

  @OneToOne(() => UserFile)
  cardImage: Ref<UserFile>

  @Property()
  sortOrder: number

  @Property()
  default: boolean

  @Enum()
  status: DATA_PORTAL_STATUS

  @ManyToOne(() => Space)
  space!: IdentifiedReference<Space>

  @OneToMany(() => Resource, (resource) => resource.dataPortal)
  resources = new Collection<Resource>(this);

  [EntityRepositoryType]?: DataPortalRepository
  constructor(space: Space) {
    super()
    this.space = Reference.create(space)
  }
}

export { DataPortal }
