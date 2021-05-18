import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { UserFile, User, Tag, Folder } from '..'
import { Asset } from '../user-file'
import { TaggingRepository } from './tagging.repository'

@Entity({ tableName: 'taggings', customRepository: () => TaggingRepository })
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

  // hardcoded to "Node"
  @Property({ hidden: true })
  taggableType: string

  // hardcoded to "User"
  @Property({ hidden: true })
  taggerType: string

  // hardcoded to "tags"
  @Property()
  context: string

  // todo: references at some point
  @ManyToOne(() => UserFile, { joinColumn: 'taggable_id' })
  userFile: UserFile

  @ManyToOne(() => Folder, { joinColumn: 'taggable_id' })
  folder: Folder

  @ManyToOne(() => Asset, { joinColumn: 'taggable_id' })
  asset: Asset

  @ManyToOne(() => Tag, { joinColumn: 'tag_id' })
  tag: Tag

  @ManyToOne(() => User, { joinColumn: 'tagger_id' })
  tagger: User;

  [EntityRepositoryType]?: TaggingRepository
}
