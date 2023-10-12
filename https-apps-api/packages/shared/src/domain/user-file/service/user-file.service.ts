import { SqlEntityManager } from '@mikro-orm/mysql'
import { User } from '../../user'
import { UserFileCreate } from '../domain/user-file-create'
import { UserFile } from '../user-file.entity'

export class UserFileService {
  private readonly em

  constructor(em: SqlEntityManager) {
    this.em = em
  }

  async createFile(fileCreate: UserFileCreate) {
    const file = new UserFile(this.em.getReference(User, fileCreate.userId))
    file.dxid = fileCreate.dxid
    file.project = fileCreate.project
    file.name = fileCreate.name
    file.state = fileCreate.state
    file.description = fileCreate.description
    file.parentType = fileCreate.parentType
    file.scope = fileCreate.scope
    file.parentFolderId = fileCreate.parentFolderId
    file.scopedParentFolderId = fileCreate.scopedParentFolderId
    file.uid = `${fileCreate.dxid}-1`

    await this.em.persistAndFlush(file)

    return file
  }

  // TODO - Remove with IOC
  static getInstance(em: SqlEntityManager) {
    return new UserFileService(em)
  }
}
