import { EntityRepository } from '@mikro-orm/mysql'
import { UserFile } from './user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE, FILE_ORIGIN_TYPE } from './user-file.types'
import { Asset } from '.'


export class UserFileRepository extends EntityRepository<UserFile> {
  async findProjectFilesInSubfolder(input: {
    project: string
    folderId: number | null
  }): Promise<UserFile[]> {
    return await this.find(
      {
        project: input.project,
        // there is implicit condition sti_type = 'UserFile'
        // stiType: { $ne: FILE_STI_TYPE.FOLDER },
        // since we merged old projects (with uploaded files) this condition no longer makes sense
        // parentType: PARENT_TYPE.JOB,
        parentFolder: input.folderId,
        entityType: FILE_ORIGIN_TYPE.HTTPS,
      },
      { populate: ['taggings.tag'], orderBy: { id: 'ASC' } },
    )
  }

  async findLocalFilesInProject(input: { project: string }): Promise<Array<UserFile | Asset>> {
    /**
     * workaround with querybuilder to avoid implicit sti_type = 'UserFile'
     * that is introduced thanks to STI mikro-orm feature.
     * We want to make sure this query returns sti_type = 'UserFile', 'Asset'
     */
    const qb = this.createQueryBuilder()
    qb.where({
      project: input.project,
      stiType: { $ne: FILE_STI_TYPE.FOLDER },
      entityType: FILE_ORIGIN_TYPE.REGULAR,
    })
    return await qb.execute()
  }

  async findFilesInFolders(input: { folderIds: number[] }): Promise<UserFile[]> {
    return await this.find(
      { parentFolder: { $in: input.folderIds } },
      { filters: ['userfile'], populate: ['taggings.tag'] },
    )
  }

  async findFileWithUid(uid: string, populate?: string[]): Promise<UserFile | null> {
    return await this.findOne(
      { uid },
      {
        filters: ['userfile'],
        populate: populate as never[] || ['user', 'taggings.tag'] as never[],
      },
    )
  }

  async findFilesWithDxid(dxid: string): Promise<UserFile[]> {
    return await this.find(
      { dxid },
      { filters: ['userfile'], populate: ['user', 'taggings.tag'] },
    )
  }

  // Find files uploaded or owned by a user that are pending
  // transition to closed state from the platform
  async findUnclosedFiles(userId: number): Promise<UserFile[]> {
    return await this.find(
      {
        userId,
        state: { $in: [FILE_STATE_DX.OPEN, FILE_STATE_DX.CLOSING] },
      },
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

  createUserFileJobRefs(fileIds: number[], jobId: number) {
    const qb = this.em.createQueryBuilder('job_inputs')
    qb.insert(fileIds.map(fileId => ({ user_file_id: fileId, job_id: jobId })))
    return qb
  }
}
