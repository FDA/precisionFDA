import { UserFile } from '../user-file.entity'
import { User } from '../../user/user.entity'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { PlatformClient } from '../../../platform-client'

class FileLockOperation extends BaseOperation<
UserOpsCtx,
IdInput,
void
> {
  protected client: PlatformClient

  async run(input: IdInput): Promise<void> {
    this.ctx.log.info(input, 'Locking file')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    this.client = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    const fileToLock = await userFileRepo.findOneOrFail(input.id)

    await em.begin()
    try {
      const filePath = `/${fileToLock.name}`
      const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_LOCKED,
        fileToLock,
        filePath,
        currentUser,
      )
      em.persist(fileEvent)
      fileToLock.locked = true
      await em.persistAndFlush(fileToLock)
      await em.commit()
      this.ctx.log.info({ fileName: fileToLock.name }, 'Locked file')
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FileLockOperation }
