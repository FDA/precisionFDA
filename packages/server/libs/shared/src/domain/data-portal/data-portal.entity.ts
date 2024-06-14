import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
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

@Entity({ tableName: 'data_portals', repository: () => DataPortalRepository })
class DataPortal extends BaseEntity {
  @Property()
  name: string

  @Property()
  urlSlug: string

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

  @Enum()
  status: DATA_PORTAL_STATUS

  @OneToOne(() => Space, (space: Space) => space.dataPortal, { owner: true })
  space!: Ref<Space>

  @OneToMany(() => Resource, (resource) => resource.dataPortal)
  resources = new Collection<Resource>(this);

  [EntityRepositoryType]?: DataPortalRepository
  constructor(space: Space) {
    super()
    this.space = Reference.create(space)
  }

  async isPortalAdmin(userId: number): Promise<boolean> {
    for (const membership of this.space.getEntity().spaceMemberships.getItems()) {
      if (membership.active && membership.isAdmin() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  async isPortalMember(userId: number): Promise<boolean> {
    for (const membership of this.space.getEntity().spaceMemberships.getItems()) {
      if (membership.active && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  async isPortalLead(userId: number): Promise<boolean> {
    for (const membership of this.space.getEntity().spaceMemberships.getItems()) {
      if (membership.active && membership.isLead() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }
}

export { DataPortal }
