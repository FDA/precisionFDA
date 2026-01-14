import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Tag } from '@shared/domain/tag/tag.entity'
import { User } from '@shared/domain/user/user.entity'
import { TaggingRepository } from './tagging.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Entity({
  abstract: true,
  tableName: 'taggings',
  discriminatorColumn: 'taggable_type',
  repository: () => TaggingRepository,
})
export class Tagging {
  @PrimaryKey()
  id: number

  @Property({ hidden: true })
  createdAt = new Date()

  // duplicates -> references are done via extra field at the bottom
  // used basically for debugging and backwards compatibility
  // resolved in userFile
  @Property()
  taggableId: number

  // resolved as user
  @Property()
  taggerId: number

  // resolved as tag
  @Property()
  tagId: number

  @Property({ hidden: true })
  taggableType: TAGGABLE_TYPE

  // hardcoded to "User"
  @Property({ hidden: true })
  taggerType: string

  // hardcoded to "tags"
  @Property()
  context: string

  @ManyToOne(() => Tag, { joinColumn: 'tag_id' })
  tag?: Tag

  @ManyToOne(() => User, { joinColumn: 'tagger_id' })
  tagger: User
}
