import { EntityRepository } from '@mikro-orm/mysql'
import { Folder } from './folder.entity'

type FindForSynchronization = {
  userId: number
  projectDxid: string
}

type FindRemote = {
  parentFolderId?: number
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
    return await this.find({ project: { $ne: null }, parentFolderId }, { filters: ['folder'] })
  }

  async findForSynchronization({ userId, projectDxid }: FindForSynchronization): Promise<Folder[]> {
    // implicit conditions on how to find folders :)
    return await this.find(
      { user: this.getReference(userId), project: projectDxid },
      { filters: ['folder'], orderBy: { id: 'ASC' } },
    )
  }
}
