import { Folder } from '../..'
import { BaseOperation } from '../../../utils/base-operation'
import { errors } from '../../..'
import { IdInput, UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'
import { User } from '../../user/user.entity'

class FolderLockOperation extends BaseOperation<
UserOpsCtx,
IdInput,
void
> {
  async run(input: IdInput): Promise<void> {
    const em = this.ctx.em

    try {
      await em.begin()
      const repo = em.getRepository(Folder)
      const folderToLock = await repo.findOne(input.id)
      if (!folderToLock) {
        throw new errors.FolderNotFoundError()
      }

      const userRepo = em.getRepository(User)
      const user = await userRepo.findOneOrFail(this.ctx.user.id)
      const folderPath = `/${folderToLock.name}`

      const folderEvent = await createFolderEvent(
        EVENT_TYPES.FOLDER_LOCKED,
        folderToLock,
        folderPath,
        user,
      )
      folderToLock.locked = true
      await em.persistAndFlush(folderEvent)
      await em.commit()
      this.ctx.log.info({ folderName: folderToLock.name }, 'Locked folder')
      return
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FolderLockOperation }

