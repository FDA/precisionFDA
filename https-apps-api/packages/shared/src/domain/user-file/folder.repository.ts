import { EntityRepository } from '@mikro-orm/mysql'
import { Folder } from './folder.entity'

type FindForSynchronization = {
  userId: number
  projectDxid: string
}

export class FolderRepository extends EntityRepository<Folder> {
  async findForSynchronization({ userId, projectDxid }: FindForSynchronization): Promise<Folder[]> {
    // implicit conditions on how to find folders :)
    return await this.find(
      { user: this.getReference(userId), project: projectDxid },
      { filters: ['folder'], orderBy: { id: 'ASC' } },
    )
  }
}
