import { EntityRepository } from '@mikro-orm/mysql'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { Folder } from './folder.entity'

type FindForUser = {
  userId: number
}

type FindForSynchronization = FindForUser & {
  projectDxid: string
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

export class FolderRepository extends EntityRepository<Folder> {
  async findOneWithProject(id: number): Promise<Folder | null> {
    return await this.findOne(
      {
        project: { $ne: null },
        id,
      },
      { filters: ['folder'] },
    )
  }

  async findChildren({ parentFolderId }: FindRemote): Promise<Folder[]> {
    return await this.find(
      { project: { $ne: null }, parentFolder: parentFolderId },
      { filters: ['folder'] },
    )
  }

  // TODO: rename to findFoldersInProject
  async findForSynchronization({ userId, projectDxid }: FindForSynchronization): Promise<Folder[]> {
    // implicit conditions on how to find folders :)
    return await this.find(
      { user: this.getReference(userId), project: projectDxid },
      { filters: ['folder'], orderBy: { id: 'ASC' }, populate: ['taggings.tag'] },
    )
  }

  // Find all folders for a particular user
  async findForUser({ userId }: FindForUser): Promise<Folder[]> {
    return await this.find(
      { user: this.getReference(userId) },
      { filters: ['folder'], orderBy: { id: 'ASC' }, populate: ['taggings.tag'] },
    )
  }

  async findAllPFDAOnlyFolders(): Promise<Folder[]> {
    return await this.findAll({
      filters: ['folder', 'pfdaonly'],
      populate: ['user', 'taggings.tag'],
    })
  }

  async findPFDAOnlyFoldersForUser({ userId }: FindForUser): Promise<Folder[]> {
    return await this.find(
      { userId },
      { filters: ['folder', 'pfdaonly'], populate: ['taggings.tag'] },
    )
  }

  async findByName(
    { name, parentId, userId, scope }: FindByName,
    tagEnable: boolean = false,
  ): Promise<Folder | null> {
    const addTaggings = tagEnable
      ? { populate: ['taggings.tag'] }
      : ({} as { populate: string[] } | {})
    const parentKey = scope.startsWith('space') ? 'scopedParentFolderId' : 'parentFolderId'

    return scope === STATIC_SCOPE.PRIVATE
      ? this.findOne(
          { name, [parentKey]: parentId, userId, scope: STATIC_SCOPE.PRIVATE },
          addTaggings,
        )
      : this.findOne({ name, [parentKey]: parentId, scope }, addTaggings)
  }

  removeWithTags(folder: Folder): Folder {
    this.em.remove(folder)
    folder.taggings.getItems().forEach((tagging) => tagging.tag.taggingCount--)
    folder.taggings.removeAll()
    return folder
  }
}
