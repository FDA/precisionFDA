import { Folder } from '@shared/domain/user-file/folder.entity'
import { User } from '@shared/domain/user/user.entity'
import { FolderNotFoundError } from '@shared/errors'
import { BaseOperation } from '@shared/utils/base-operation'
import { IdInput, UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'
import { getNodePath } from '../user-file.helper'

class FolderUnlockOperation extends BaseOperation<UserOpsCtx, IdInput, void> {
  async run(input: IdInput): Promise<void> {
    const em = this.ctx.em
    const userRepo = em.getRepository(User)
    const user = await userRepo.findOneOrFail(this.ctx.user.id)
    const repo = em.getRepository(Folder)
    const folderToUnlock = await repo.findOne(input.id)
    if (!folderToUnlock) {
      throw new FolderNotFoundError()
    }
    try {
      await em.begin()
      const folderPath = await getNodePath(em, folderToUnlock)
      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_UNLOCKED,
        folderToUnlock,
        folderPath,
        user,
      )
      folderToUnlock.locked = false
      folderToUnlock.state = null
      await em.persistAndFlush(folderEvent)
      await em.commit()
      this.ctx.log.log({ folderId: folderToUnlock.id }, 'Unlocked folder')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FolderUnlockOperation }
