import { User, userFile } from '../..'
import { BaseOperation } from '../../../utils'
import { Node } from '../node.entity'
import { NodesInput } from '../user-file.input'
import { FILE_STI_TYPE } from '../user-file.types'
import { errors, getLogger } from '../../..'
import { UserOpsCtx } from '../../../types'
import { filterNodesByUser, getSuccessMessage, loadNodes } from '../user-file.helper'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import { NotificationService } from '../../notification'
import { SqlEntityManager } from '@mikro-orm/mysql'

const rollbackLockingState = async (em: SqlEntityManager, nodes: Node[]): Promise<void> => {
  getLogger().error(`Rolling back locking state for ${nodes.length} nodes`)
  nodes.forEach(node => {
    node.locked = false
  })
  await em.flush()
}

class NodesLockOperation extends BaseOperation<UserOpsCtx, NodesInput, void> {
  async run(input: NodesInput): Promise<void> {
    this.ctx.log.info(input.ids, 'NodesLockOperation: Locking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: false })
    const notificationService = new NotificationService(em)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const filteredNodes = await filterNodesByUser(em, nodes, currentUser)
    let lockedFilesCount = 0
    let lockedFoldersCount = 0
    if (filteredNodes?.length) {
      try {
        const fileLockOp = new userFile.FileLockOperation(this.ctx)
        const folderLockOp = new userFile.FolderLockOperation(this.ctx)
        for (const node of filteredNodes) {
          if (node.stiType === FILE_STI_TYPE.ASSET) {
            this.ctx.log.error(`NodesLockOperation: Locking of asset  ${node.uid} is not allowed`)
            throw new errors.PermissionError(`Locking of asset  ${node.uid} is not allowed`)
          }
          if (node.stiType === FILE_STI_TYPE.USERFILE) {
            await fileLockOp.execute({ id: node.id })
            lockedFilesCount++
          } else {
            await folderLockOp.execute({ id: node.id })
            lockedFoldersCount++
          }
        }

        if (input.async) {
          await notificationService.createNotification({
            message: getSuccessMessage(lockedFilesCount, lockedFoldersCount, 'Successfully locked'),
            severity: SEVERITY.INFO,
            action: NOTIFICATION_ACTION.NODES_LOCKED,
            userId: this.ctx.user.id,
          })
        }

        this.ctx.log.info(
          { foldersCount: lockedFoldersCount, filesCount: lockedFilesCount },
          'NodesLockOperation: Locked total objects',
        )
      } catch (err) {
        this.ctx.log.error(`Error while locking files and folders: ${err}`)
        await notificationService.createNotification({
          message: 'Error locking files and folders.',
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.NODES_LOCKED,
          userId: this.ctx.user.id,
        })
        await rollbackLockingState(em, nodes)
        throw err
      }
    }
  }
}

export { NodesLockOperation }