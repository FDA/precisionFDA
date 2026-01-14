import {
  Collection,
  Entity,
  EntityDTO,
  Filter,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { FolderRepository } from './folder.repository'
import { Node } from './node.entity'
import { FILE_STI_TYPE } from './user-file.types'

@Filter({ name: 'pfdaonly', cond: { project: null } })
@Entity({
  tableName: 'nodes',
  repository: () => FolderRepository,
  discriminatorColumn: 'stiType',
  discriminatorValue: FILE_STI_TYPE.FOLDER,
})
export class Folder extends Node {
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

  @Property()
  userId: number

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

  @Property({ persist: false, serializedName: 'children' })
  get childrenArray(): EntityDTO<Node>[] {
    return this.children.toArray()
  }

  // PFDA-only folder, which is sometimes referred to as 'local' folder or 'core' folder by Omar
  // are the initial implementation of folder on pFDA that does not have a counterpart on platform.
  // All of its children are stored at the root of the dx project instead of inside the correct
  // platform folder.
  isPFDAOnly(): boolean {
    return this.project === null
  }

  isPublishable(): boolean {
    return this.isPrivate()
  }

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
