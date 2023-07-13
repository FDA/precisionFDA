import { UserFile } from '../user-file.entity'
import { User } from '../../user'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { getNodePath } from '../user-file.helper'

class FileLockOperation extends BaseOperation<UserOpsCtx, IdInput, void> {
  async run(input: IdInput): Promise<void> {
    this.ctx.log.info(input, 'Locking file')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const fileToLock = await userFileRepo.findOneOrFail(input.id)
    try {
      await em.begin()
      const filePath = await getNodePath(em, fileToLock)
      fileToLock.locked = true
      await em.persistAndFlush(fileToLock)
      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_LOCKED,
        fileToLock,
        filePath,
        currentUser,
      )
      em.persist(fileEvent)

      await em.commit()
      this.ctx.log.info({ fileName: fileToLock.name }, 'Locked file')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FileLockOperation }
