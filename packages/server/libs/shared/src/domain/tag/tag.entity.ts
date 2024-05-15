import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TagRepository } from './tag.repository'

@Entity({ tableName: 'tags', repository: () => TagRepository })
export class Tag {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property({ fieldName: 'taggings_count' })
  taggingCount: number

  @OneToMany({
    entity: () => Tagging,
    mappedBy: t => t.tag,
  })
  taggings = new Collection<Tagging>(this);

  [EntityRepositoryType]?: TagRepository
}
