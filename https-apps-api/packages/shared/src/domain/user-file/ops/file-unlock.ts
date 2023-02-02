import { UserFile } from '../user-file.entity'
import { User } from '../../user/user.entity'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { PlatformClient } from '../../../platform-client'

class FileUnlockOperation extends BaseOperation<
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
    const fileToUnlock = await userFileRepo.findOneOrFail(input.id)

    await em.begin()
    try {
      const filePath = `/${fileToUnlock.name}`

      const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
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
