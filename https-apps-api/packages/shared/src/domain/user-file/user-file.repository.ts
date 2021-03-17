import { EntityRepository } from '@mikro-orm/mysql'
import { UserFile } from './user-file.entity'
import { FILE_STI_TYPE } from './user-file.enum'

export class UserFileRepository extends EntityRepository<UserFile> {
  // ???? find another way
  // async findSnapshot(input: { userId: number; project: string }): Promise<UserFile | null> {
  //   const file = await this.findOne({
  //     user: input.userId,
  //     project: input.project,
  //     entityType: FILE_ORIGIN_TYPE.REGULAR,
  //   })
  //   return file
  // }

  async findProjectFiles(input: { project: string }): Promise<UserFile[]> {
    return await this.find(
      { project: input.project, stiType: { $ne: FILE_STI_TYPE.FOLDER } },
      { populate: ['taggings.tag'] },
    )
  }

  async findProjectFilesInSubfolder(input: {
    project: string
    folderId: number | null
  }): Promise<UserFile[]> {
    return await this.find(
      {
        project: input.project,
        stiType: { $ne: FILE_STI_TYPE.FOLDER },
        // since we merged old projects (with uploaded files) this condition no longer makes sense
        // parentType: PARENT_TYPE.JOB,
        parentFolderId: input.folderId,
        entityType: FILE_ORIGIN_TYPE.HTTPS,
      },
      { populate: ['taggings.tag'], orderBy: { id: 'ASC' } },
    )
  }

  async findLocalFilesInProject(input: { project: string }): Promise<UserFile[]> {
    return await this.find(
      {
        project: input.project,
        stiType: { $ne: FILE_STI_TYPE.FOLDER },
        entityType: FILE_ORIGIN_TYPE.REGULAR,
      },
      { populate: [], orderBy: { id: 'ASC' } },
    )
  }

  async findFilesInFolders(input: { folderIds: number[] }): Promise<UserFile[]> {
    return await this.find(
      { parentFolderId: { $in: input.folderIds } },
      { filters: ['userfile'], populate: ['taggings.tag'] },
    )
  }

  removeFilesWithTags(files: UserFile[]): UserFile[] {
    return files.map(file => {
      this.remove(file)
      file.taggings.getItems().forEach(tagging => tagging.tag.taggingCount--)
      file.taggings.removeAll()
      return file
    })
  }

  async createUserFileJobRefs(fileIds: number[], jobId: number) {
    const qb = this.em.createQueryBuilder('job_inputs')
    qb.insert(fileIds.map(fileId => ({ user_file_id: fileId, job_id: jobId })))
    return await qb.execute()
  }
}
