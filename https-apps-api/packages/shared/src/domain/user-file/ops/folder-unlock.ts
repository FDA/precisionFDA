import { Folder } from '../..'
import { BaseOperation } from '../../../utils/base-operation'
import { errors } from '../../..'
import { IdInput, UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'
import { User } from '../../user/user.entity'

class FolderUnlockOperation extends BaseOperation<
UserOpsCtx,
IdInput,
void
> {
  async run(input: IdInput): Promise<void> {
    const em = this.ctx.em

    try {
      await em.begin()
      const repo = em.getRepository(Folder)
      const folderToUnlock = await repo.findOne(input.id)
      if (!folderToUnlock) {
        throw new errors.FolderNotFoundError()
      }
      const userRepo = em.getRepository(User)
      const user = await userRepo.findOneOrFail(this.ctx.user.id)
      const folderPath = `/${folderToUnlock.name}`
      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_UNLOCKED,
        folderToUnlock,
        folderPath,
        user,
      )
      folderToUnlock.locked = false
      await em.persistAndFlush(folderEvent)
      await em.commit()
      this.ctx.log.info({ folderName: folderToUnlock.name }, 'Unlocked folder')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FolderUnlockOperation }
