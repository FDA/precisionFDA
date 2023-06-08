import { Folder, UserFile } from '../..'
import { BaseOperation } from '../../../utils/base-operation'
import { client, errors } from '../../..'
import {
  childrenTraverse,
  getFolderPath,
  getNodePath,
  validateProtectedSpaces
} from '../user-file.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'
import { User } from '../../user/user.entity'

/**
 * This operation removes also contents of the folder and is used by ruby backend.
 */
export class FolderRemoveRecursiveOperation extends BaseOperation<
UserOpsCtx,
IdInput,
number
> {
  async run(input: IdInput): Promise<number> {
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)

    try {
      const repo = em.getRepository(Folder)
      const userFileRepo = em.getRepository(UserFile)
      const existingFolder = await repo.findOneWithProject(input.id)

      await em.begin()
      if (!existingFolder) {
        throw new errors.FolderNotFoundError()
      }

      await validateProtectedSpaces(em, 'remove', this.ctx.user.id, existingFolder)

      // subfolders include "existingFolder"
      const foldersInProject = await repo.findForSynchronization({
        userId: this.ctx.user.id,
        projectDxid: existingFolder.project!,
      })
      const folderSubtree = await childrenTraverse(existingFolder, repo, [])
      const folderPath = await getNodePath(em, existingFolder)
        // getFolderPath(foldersInProject, existingFolder)
      const filesToRemove = await userFileRepo.findFilesInFolders({
        folderIds: folderSubtree.map(f => f.id),
      })
      const totalNodesCnt = folderSubtree.length + filesToRemove.length
      if (totalNodesCnt >= 10000) {
        this.ctx.log.warn(
          { totalNodesCnt },
          'Too many nodes to remove, removeFolder API call may not work',
        )
      }
      await platformClient.folderRemove({
        projectId: existingFolder.project!,
        folderPath,
      })
      userFileRepo.removeFilesWithTags(filesToRemove)

      const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
      for (const folder of folderSubtree) {
        const folderEvent = await createFolderEvent(
          EVENT_TYPES.FOLDER_DELETED,
          folder,
          folderPath,
          currentUser
        )
        em.persist(folderEvent)
        em.remove(folder)
      }

      await em.commit()
      this.ctx.log.info(
        { foldersCnt: folderSubtree.length, filesCnt: filesToRemove.length },
        'Removed total objects',
      )
      // the count of removed folders
      return folderSubtree.length
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}
