import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { FolderRepository } from './folder.repository'
import { Node } from './node.entity'
import { FILE_STI_TYPE, FOLDER_STATE, ITrackable, PARENT_TYPE } from './user-file.types'

@Entity({
  tableName: 'nodes',
  repository: () => FolderRepository,
  discriminatorColumn: 'stiType',
  discriminatorValue: FILE_STI_TYPE.FOLDER,
})
@Filter({ name: 'folder', cond: { stiType: FILE_STI_TYPE.FOLDER } })
@Filter({ name: 'pfdaonly', cond: { project: null } })
export class Folder extends Node implements ITrackable {
  @Property({ nullable: true })
  project?: string

  @Property()
  description?: string

  @Property()
  state: FOLDER_STATE

  @Property({ type: 'bigint', hidden: true })
  fileSize?: number

  /**
   * @deprecated Do not use this attribute. Workaround for children mapping by two columns based on scope.
   * Use @children property instead.
   */
  @OneToMany({
    entity: () => Node,
    mappedBy: (n) => n.parentFolder,
    hidden: true,
  })
  nonScopedChildren = new Collection<Node>(this)

  /**
   * @deprecated Do not use this attribute.
   * Use @children property instead.
   */
  @OneToMany({
    entity: () => Node,
    mappedBy: (n) => n.scopedParentFolder,
    hidden: true,
  })
  scopedChildren = new Collection<Node>(this)

  // unused FK references
  // resolves into User/Job/Asset and other entities in PFDA
  @Property()
  parentId: number

  @Property()
  parentType: PARENT_TYPE

  @Property()
  parentFolderId?: number

  @Property()
  scopedParentFolderId?: number

  // todo: micro-orm can do single table inheritance

  @OneToMany(() => Tagging, (tagging) => tagging.folder, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @Property()
  userId: number

  @ManyToOne(() => User)
  user!: Ref<User>

  /**
   * Children collection always has to be initialized by caller using 'init()'
   */
  get children(): Collection<Node> {
    if (this.scope.startsWith('space-')) {
      // intended usage of deprecated property
      return this.scopedChildren
    } else {
      // intended usage of deprecated property
      return this.nonScopedChildren
    }
  }

  @Property({ persist: false, serializedName: 'children'})
  get childrenArray() {
    return this.children.toArray();
  }

  // PFDA-only folder, which is sometimes referred to as 'local' folder or 'core' folder by Omar
  // are the initial implementation of folder on pFDA that does not have a counterpart on platform.
  // All of its children are stored at the root of the dx project instead of inside the correct
  // platform folder.
  isPFDAOnly(): boolean {
    return this.project === undefined
  }

  [EntityRepositoryType]?: FolderRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
