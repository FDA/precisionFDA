import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { User } from '../../user'
import { UserFileCreate } from '../domain/user-file-create'
import { UserFile } from '../user-file.entity'

@Injectable()
export class UserFileService {
  constructor(private readonly em: SqlEntityManager) {}

  async createFile(fileCreate: UserFileCreate) {
    const file = new UserFile(this.em.getReference(User, fileCreate.userId))
    file.dxid = fileCreate.dxid
    file.project = fileCreate.project
    file.name = fileCreate.name
    file.state = fileCreate.state
    file.description = fileCreate.description
    file.parentType = fileCreate.parentType
    file.parentId = fileCreate.parentId
    file.scope = fileCreate.scope
    file.parentFolderId = fileCreate.parentFolderId
    file.scopedParentFolderId = fileCreate.scopedParentFolderId
    file.uid = `${fileCreate.dxid}-1`

    await this.em.persistAndFlush(file)

    return file
  }
}
