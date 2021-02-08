import { Folder } from '../..'
import { BaseOperation } from '../../../utils/base-operation'
import { RenameFolderInput } from '../user-file.input'
import { client, errors } from '../../..'
import { getFolderPath } from '../user-file.helper'

export class FolderRenameOperation extends BaseOperation<RenameFolderInput, Folder> {
  async run(input: RenameFolderInput): Promise<Folder> {
    const em = this.ctx.em
    await em.begin()
    try {
      const folderRepo = em.getRepository(Folder)
      const existingFolder = await folderRepo.findOneWithProject(input.id)
      if (!existingFolder) {
        throw new errors.FolderNotFoundError()
      }
      if (existingFolder.name === input.newName) {
        // nothing to change
        this.ctx.log.debug('new name is the same as current name, skipping')
        return existingFolder
      }
      const folders = await folderRepo.findForSynchronization({
        userId: this.ctx.user.id,
        projectDxid: existingFolder.project,
      })
      const folderPath = getFolderPath(folders, existingFolder)
      // client api call
      await client.renameFolder({
        accessToken: this.ctx.user.accessToken,
        folderPath,
        newName: input.newName,
        projectId: existingFolder.project,
      })
      existingFolder.name = input.newName
      await em.commit()

      return existingFolder
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}
