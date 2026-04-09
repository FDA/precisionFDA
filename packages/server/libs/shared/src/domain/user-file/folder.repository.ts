import { FilterQuery } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { Folder } from './folder.entity'

type FindForUser = {
  userId: number
}

type FindForSynchronization = FindForUser & {
  projectDxid: DxId<'project'>
}

type FindRemote = {
  parentFolderId?: number
}

type FindByName = {
  scope: SCOPE
  userId: number
  name: string
  parentId: number
}

export class FolderRepository extends AccessControlRepository<Folder> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Folder>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

    return {
      $or: [{ user: user.id, scope: STATIC_SCOPE.PRIVATE }, { scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Folder>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map(space => space.scope)

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }

  async findOneWithProject(id: number): Promise<Folder | null> {
    return await this.findOne({
      project: { $ne: null },
      id,
    })
  }

  async findChildren({ parentFolderId }: FindRemote): Promise<Folder[]> {
    return await this.find({ project: { $ne: null }, parentFolder: parentFolderId })
  }

  // TODO: rename to findFoldersInProject
  async findForSynchronization({ userId, projectDxid }: FindForSynchronization): Promise<Folder[]> {
    // implicit conditions on how to find folders :)
    return await this.find(
      { user: this.getReference(userId), project: projectDxid },
      { orderBy: { id: 'ASC' }, populate: ['taggings.tag'] },
    )
  }

  // Find all folders for a particular user
  async findForUser({ userId }: FindForUser): Promise<Folder[]> {
    return await this.find({ user: this.getReference(userId) }, { orderBy: { id: 'ASC' }, populate: ['taggings.tag'] })
  }

  async findAllPFDAOnlyFolders(): Promise<Folder[]> {
    return await this.findAll({
      filters: ['pfdaonly'],
      populate: ['user', 'taggings.tag'],
    })
  }

  async findPFDAOnlyFoldersForUser({ userId }: FindForUser): Promise<Folder[]> {
    return await this.find({ userId }, { filters: ['pfdaonly'], populate: ['taggings.tag'] })
  }

  async findByName({ name, parentId, userId, scope }: FindByName, tagEnable: boolean = false): Promise<Folder | null> {
    const addTaggings = tagEnable ? { populate: ['taggings.tag'] } : ({} as { populate: string[] } | object)
    const parentKey = scope.startsWith('space') ? 'scopedParentFolderId' : 'parentFolderId'

    return scope === STATIC_SCOPE.PRIVATE
      ? this.findOne({ name, [parentKey]: parentId, userId, scope: STATIC_SCOPE.PRIVATE }, addTaggings)
      : this.findOne({ name, [parentKey]: parentId, scope }, addTaggings)
  }
}
