import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ResolvePathDTO } from '@shared/domain/user-file/dto/user-file.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NodeResponse, ResolvePath } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { PermissionError } from '@shared/errors'
import { SCOPE } from '@shared/types/common'

@Injectable()
export class UserFileResolverFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
  ) {}

  async resolvePath({ path, scope, type }: ResolvePathDTO): Promise<ResolvePath> {
    const userId = this.user.id

    // TODO(Julie): Move this to a decorator (37-46)
    const user = await this.em
      .getRepository(User)
      .findOneOrFail({ id: userId }, { populate: ['spaceMemberships', 'spaceMemberships.spaces'] })
    const viewableSpaces = []
    user.spaceMemberships
      .getItems()
      .filter((m) => m.active)
      .forEach((spaceMembership) => {
        spaceMembership.spaces
          .getItems()
          .forEach((space) => viewableSpaces.push(`space-${space.id}`))
    })
    if (scope.startsWith('space') && !viewableSpaces.includes(scope)) {
      throw new PermissionError('User is not a member of the scope')
    }
    const items = path?.split('/')?.filter(Boolean) ?? []
    const lastItem = items.pop()
    const parentId = await this.findFolderIdByPath(items, scope) as number | null
    if ((items.length && !parentId) || !lastItem) return { path, scope, nodes: [] }

    const nodes: NodeResponse[] = []
    let isFetchingFolder = false, isFetchingFiles = false
    if (type === 'folder') {
      isFetchingFolder = true
    } else if (type === 'file') {
      isFetchingFiles = true
    } else {
      isFetchingFolder = true
      isFetchingFiles = true
    }

    if (isFetchingFolder) {
      const folder = await this.em.getRepository(Folder).findByName({
        name: lastItem,
        parentId,
        userId,
        scope,
      }, true)
      if (folder) nodes.push(...this.mapNodeResponse([folder], parentId, 'Folder'))
    }

    if (isFetchingFiles) {
      const files = await this.em.getRepository(UserFile).findAllFilesByName({
        name: lastItem,
        parentId,
        userId,
        scope,
      })
      if (files?.length) nodes.push(...this.mapNodeResponse(files, parentId, 'UserFile'))
    }

    return { path, scope, nodes }
  }

  private async findFolderIdByPath(path: string[], scope: SCOPE): Promise<number | null> {
    let parentId: number | null = null
    for (const item of path) {
      const parentFolder = await this.em.getRepository(Folder).findByName({
        name: item,
        parentId,
        userId: this.user.id,
        scope,
      }, false)
      if (!parentFolder) return null
      parentId = parentFolder.id
    }
    return parentId
  }

  private mapNodeResponse(
    nodes: (Folder | UserFile)[],
    parentId: number | null,
    type: 'Folder' | 'UserFile',
  ): NodeResponse[] {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: type,
      uid: node.uid,
      dxid: node.dxid,
      state: node.state,
      file_size: parseInt(`${node.fileSize}` ?? '0'),
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      locked: node.locked,
      tags: node.taggings.getItems().map(t => t.tag.name),
      parent_folder_id: parentId,
    }))
  }
}
