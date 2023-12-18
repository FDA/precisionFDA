import { Folder, tagging } from '../..'
import { BaseOperation } from '../../../utils/base-operation'
import { client, errors } from '../../..'
import { getNodePath, validateEditableBy, validateProtectedSpaces, validateVerificationSpace } from '../user-file.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'
import { User } from '../../user/user.entity'
import { FILE_ORIGIN_TYPE } from '../user-file.types'

/**
 * This operation removes single folder if it's empty.
 * Throws exception if it's not empty.
 */
class FolderRemoveOperation extends BaseOperation<
UserOpsCtx,
IdInput,
number
> {
  async run(input: IdInput): Promise<number> {
    const em = this.ctx.em.fork()
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)

    try {
      await em.begin()
      const repo = em.getRepository(Folder)
      const folderToRemove = await repo.findOne(input.id)

      folderToRemove && await validateProtectedSpaces(em, 'remove', this.ctx.user.id, folderToRemove)

      if (!folderToRemove) {
        throw new errors.FolderNotFoundError()
      }

      await folderToRemove.children.init()
      if (folderToRemove.children.length > 0) {
        throw new Error(`Cannot remove folder ${folderToRemove.name}`
          + 'with children. Remove children first.')
      }
      const userRepo = em.getRepository(User)
      const user = await userRepo.findOneOrFail(this.ctx.user.id)

      await validateEditableBy(em, folderToRemove, user)
      await validateVerificationSpace(em, folderToRemove)

      const folderPath = await getNodePath(em, folderToRemove)

      const op = new tagging.RemoveTaggingsOperation({ em, log: this.ctx.log, user: this.ctx.user })
      await op.execute(folderToRemove.id)

      if (folderToRemove.entityType === FILE_ORIGIN_TYPE.HTTPS
        && folderToRemove.project) { // https folder
        await platformClient.folderRemove({
          projectId: folderToRemove.project,
          folderPath,
        })
      }

      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_DELETED,
        folderToRemove,
        folderPath,
        user,
      )

      em.persist(folderEvent)
      em.remove(folderToRemove)
      await em.commit()
      this.ctx.log.info({ folderName: folderToRemove.name }, 'Removed folder')
      return 1
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FolderRemoveOperation }
