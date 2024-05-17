import { RemoveTaggingsOperation } from '@shared/domain/tagging/ops/remove-taggings'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderNotFoundError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { BaseOperation } from '@shared/utils/base-operation'
import { IdInput, UserOpsCtx } from '../../../types'
import { EVENT_TYPES, createFolderEvent } from '../../event/event.helper'
import { User } from '../../user/user.entity'
import {
  getNodePath,
  validateEditableBy,
  validateProtectedSpaces,
  validateVerificationSpace,
} from '../user-file.helper'

/**
 * This operation removes single folder if it's empty.
 * Throws exception if it's not empty.
 */
class FolderRemoveOperation extends BaseOperation<UserOpsCtx, IdInput, number> {
  async run(input: IdInput): Promise<number> {
    const em = this.ctx.em
    const platformClient = new PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )

    return em.transactional(async (tem) => {
      const repo = tem.getRepository(Folder)
      const folderToRemove = await repo.findOne(input.id)

      folderToRemove &&
        (await validateProtectedSpaces(tem, 'remove', this.ctx.user.id, folderToRemove))

      if (!folderToRemove) {
        throw new FolderNotFoundError()
      }

      await folderToRemove.children.init()
      if (folderToRemove.children.length > 0) {
        throw new Error(
          `Cannot remove folder ${folderToRemove.name} with children. Remove children first.`,
        )
      }
      const userRepo = tem.getRepository(User)
      const user = await userRepo.findOneOrFail(this.ctx.user.id)

      await validateEditableBy(tem, folderToRemove, user)
      await validateVerificationSpace(tem, folderToRemove)

      const folderPath = await getNodePath(tem, folderToRemove)

      const op = new RemoveTaggingsOperation({ em: tem, log: this.ctx.log, user: this.ctx.user })
      await op.execute(folderToRemove.id)

      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_DELETED,
        folderToRemove,
        folderPath,
        user,
      )

      tem.persist(folderEvent)
      tem.remove(folderToRemove)
      this.ctx.log.verbose({ folderName: folderToRemove.name }, 'Removed folder')
      return 1
    })
  }
}

export { FolderRemoveOperation }
