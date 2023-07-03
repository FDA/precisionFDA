import { UserFile } from '../user-file.entity'
import { User } from '../../user'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { getNodePath } from '../user-file.helper'
import { errors } from '@pfda/https-apps-shared'

class FileUnlockOperation extends BaseOperation<UserOpsCtx, IdInput, void> {
  async run(input: IdInput): Promise<void> {
    this.ctx.log.info(input, 'Locking file')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const fileToUnlock = await userFileRepo.findOneOrFail(input.id)
    try {
      await em.begin()
      const filePath = await getNodePath(em, fileToUnlock)
      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_UNLOCKED,
        fileToUnlock,
        filePath,
        currentUser,
      )
      em.persist(fileEvent)
      fileToUnlock.locked = false
      await em.persistAndFlush(fileToUnlock)
      await em.commit()
      this.ctx.log.info({ fileName: fileToUnlock.name }, 'Unlocked file')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FileUnlockOperation }
