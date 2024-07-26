import { User } from '@shared/domain/user/user.entity'
import type { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '@shared/utils/base-operation'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { UserFile } from '../user-file.entity'
import { getNodePath } from '../user-file.helper'
import { FILE_STATE_DX } from '../user-file.types'

class FileLockOperation extends BaseOperation<UserOpsCtx, IdInput[], void> {
  async run(input: IdInput[]): Promise<void> {
    this.ctx.log.log(input, 'Locking files')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    const filesToLock = await userFileRepo.find(input?.map(i => i.id))
    try {
      await em.begin()

      filesToLock.forEach(f => this.updateFile(f))
      await em.persistAndFlush(filesToLock)

      await Promise.all(filesToLock.map(f => this.createEvent(f)))
      await em.commit()

      filesToLock.forEach(f => this.logOperation(f))
    } catch (err) {
      await em.rollback()
      throw err
    }
  }

  private logOperation(file: UserFile): void {
    this.ctx.log.log({ fileName: file.name }, 'Locked file')
  }

  private async createEvent(file: UserFile): Promise<void> {
    const [user, filePath] = await Promise.all([
      this.ctx.em.findOneOrFail(User, { id: this.ctx.user.id }),
      await getNodePath(this.ctx.em, file),
    ])

    const event = await createFileEvent(
      EVENT_TYPES.FILE_LOCKED,
      file,
      filePath,
      user,
    )

    this.ctx.em.persist(event)
  }

  private updateFile(file: UserFile): void {
    file.locked = true
    file.state = FILE_STATE_DX.CLOSED
  }
}

export { FileLockOperation }
