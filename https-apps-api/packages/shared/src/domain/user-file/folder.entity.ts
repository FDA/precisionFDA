import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Tagging, User } from '..'
import { FolderRepository } from './folder.repository'
import { Node } from './node.entity'
import { FOLDER_STATE, FILE_STI_TYPE, FILE_ORIGIN_TYPE, PARENT_TYPE, ITrackable } from './user-file.types'

@Entity({ tableName: 'nodes', customRepository: () => FolderRepository })
@Filter({ name: 'folder', cond: { stiType: FILE_STI_TYPE.FOLDER } })
export class Folder extends Node implements ITrackable {
  @Property()
  project?: string

  @Property()
  description?: string

  @Property()
  state: FOLDER_STATE

  @Property()
  entityType: FILE_ORIGIN_TYPE

  @Property({ type: 'bigint', hidden: true })
  fileSize?: number

  /**
   * @deprecated Do not use this attribute. Workaround for children mapping by two columns based on scope.
   * Use @children property instead.
   */
  @OneToMany({
    entity: () => Node,
    mappedBy: n => n.parentFolder,
    hidden: true,
  })
  nonScopedChildren = new Collection<Node>(this)

  /**
   * @deprecated Do not use this attribute.
   * Use @children property instead.
   */
  @OneToMany({
    entity: () => Node,
    mappedBy: n => n.scopedParentFolder,
    hidden: true,
  })
  scopedChildren = new Collection<Node>(this)

  // unused FK references
  // resolves into User/Job/Asset and other entities in PFDA
  @Property()
  parentId: number

  @Property()
  parentType: PARENT_TYPE

  // todo: micro-orm can do single table inheritance

  @OneToMany(() => Tagging, tagging => tagging.folder, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>;

  /**
   * Children collection always has to be initialized by caller using 'init()'
   */
  @Property({persist: false})
  get children(): Collection<Node> {
    if (this.scope.startsWith("space-")) {
      // intended usage of deprecated property
      return this.scopedChildren;
    } else {
      // intended usage of deprecated property
      return this.nonScopedChildren;
    }
  }

  [EntityRepositoryType]?: FolderRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

}
