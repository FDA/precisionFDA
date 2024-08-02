import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '../user-file.entity'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '@shared/utils/base-operation'
import { getNodePath } from '../user-file.helper'
import { FILE_STATE_DX } from '../user-file.types'

class FileUnlockOperation extends BaseOperation<UserOpsCtx, IdInput, void> {
  async run(input: IdInput): Promise<void> {
    this.ctx.log.log(input, 'Locking file')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const fileToUnlock = await userFileRepo.findOneOrFail(input.id)
    try {
      await em.begin()
      const filePath = await getNodePath(em, fileToUnlock)

      fileToUnlock.locked = false
      fileToUnlock.state = FILE_STATE_DX.CLOSED
      await em.persistAndFlush(fileToUnlock)
      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_UNLOCKED,
        fileToUnlock,
        filePath,
        currentUser,
      )
      em.persist(fileEvent)

      await em.commit()
      this.ctx.log.log({ fileUid: fileToUnlock.uid }, 'Unlocked file')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FileUnlockOperation }
