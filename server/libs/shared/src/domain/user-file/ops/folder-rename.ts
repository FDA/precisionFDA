import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderNotFoundError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { BaseOperation } from '@shared/utils/base-operation'
import { RenameFolderInput } from '../user-file.input'
import { getFolderPath } from '../user-file.helper'
import { UserOpsCtx } from '../../../types'

export class FolderRenameOperation extends BaseOperation<UserOpsCtx, RenameFolderInput, Folder> {
  async run(input: RenameFolderInput): Promise<Folder> {
    const em = this.ctx.em
    const platformClient = new PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )

    const folderRepo = em.getRepository(Folder)
    const existingFolder = await folderRepo.findOneWithProject(input.id)
    if (!existingFolder) {
      throw new FolderNotFoundError()
    }
    if (existingFolder.name === input.newName) {
      // nothing to change
      this.ctx.log.debug('new name is the same as current name, skipping')
      return existingFolder
    }
    const folders = await folderRepo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: existingFolder.project!,
    })
    const folderPath = getFolderPath(folders, existingFolder)
    // client api call
    await platformClient.renameFolder({
      folderPath,
      newName: input.newName,
      projectId: existingFolder.project!,
    })
    existingFolder.name = input.newName
    await em.flush()

    return existingFolder
  }
}
