import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { TaggingRepository } from './tagging.repository'

@Entity({ tableName: 'taggings', repository: () => TaggingRepository })
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
