import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { Tagging } from '../tagging'

@Entity({ tableName: 'tags' })
export class Tag extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  name: string

  @Property()
  taggingCount: number

  @OneToMany({
    entity: () => Tagging,
    mappedBy: t => t.tag,
  })
  taggings = new Collection<Tagging>(this)
}
