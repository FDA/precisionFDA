import { EntityRepository } from '@mikro-orm/core'
import { UserFile } from './user-file.entity'
import { FILE_TYPE } from './user-file.enum'

export class UserFileRepository extends EntityRepository<UserFile> {
  async findSnapshot(input: { userId: number; project: string }): Promise<UserFile | null> {
    const file = await this.findOne({
      user: input.userId,
      project: input.project,
      entityType: FILE_TYPE.SNAPSHOT,
    })
    return file
  }

  async findProjectFiles(input: { project: string }): Promise<UserFile[]> {
    return await this.find({ project: input.project })
  }
}
