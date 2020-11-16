import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Job } from '..'
import { BaseEntity } from '../../database/base-entity'
import { Tag } from '../tag'

@Entity({ tableName: 'taggings' })
export class Tagging extends BaseEntity {
  @PrimaryKey()
  id: number

  // @Property()
  // tagId: number

  // @Property()
  // taggableId: number

  @Property({ hidden: true })
  taggableType: string

  // todo: reference user, probably
  @Property()
  taggerId: number

  @Property({ hidden: true })
  taggerType: string

  @Property()
  context: string

  // todo: references at some point
  @ManyToOne(() => Job, { joinColumn: 'taggable_id' })
  job: Job

  @ManyToOne(() => Tag, { joinColumn: 'tag_id' })
  tag: Tag
}
