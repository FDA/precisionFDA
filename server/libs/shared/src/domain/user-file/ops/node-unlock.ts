import { BaseOperation } from '../../../utils'
import { Node } from '../node.entity'
import { NodesInput } from '../user-file.input'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { UserOpsCtx } from '../../../types'
import { User, userFile } from '../..'
import { filterNodesByUser, getSuccessMessage, loadNodes } from '../user-file.helper'
import { errors, getLogger } from '../../..'
import { NotificationService } from '../../notification'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import { SqlEntityManager } from '@mikro-orm/mysql'

const rollbackUnlockingState = async (em: SqlEntityManager, nodes: Node[]): Promise<void> => {
  getLogger().error(`Rolling back unlocking state for ${nodes.length} nodes`)
  nodes.forEach(node => {
    node.locked = true
    node.state = FILE_STATE_DX.CLOSED
  })
  await em.flush()
}

class NodesUnlockOperation extends BaseOperation<UserOpsCtx, NodesInput, void> {
  async run(input: NodesInput): Promise<void> {
    this.ctx.log.verbose(input.ids, 'NodesUnlockOperation: Unlocking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: true })
    const notificationService = new NotificationService(em)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const filteredNodes = await filterNodesByUser(em, nodes, currentUser)
    let unlockedFilesCount = 0
    let unlockedFoldersCount = 0
    if (filteredNodes?.length) {
      try {
        const fileUnlockOp = new userFile.FileUnlockOperation(this.ctx)
        const folderUnlockOp = new userFile.FolderUnlockOperation(this.ctx)

        for (const node of filteredNodes) {
          if (node.stiType === FILE_STI_TYPE.ASSET) {
            this.ctx.log.error(
              `NodesUnlockOperation: Unlocking of asset  ${node.uid} is not allowed`,
            )
            throw new errors.PermissionError(`Unlocking of asset  ${node.uid} is not allowed`)
          }

          if (node.stiType === FILE_STI_TYPE.USERFILE) {
            await fileUnlockOp.execute({ id: node.id })
            unlockedFilesCount++
          } else {
            await folderUnlockOp.execute({ id: node.id })
            unlockedFoldersCount++
          }
        }
        if (input.async) {
          await notificationService.createNotification({
            message: getSuccessMessage(
              unlockedFilesCount,
              unlockedFoldersCount,
              'Successfully unlocked',
            ),
            severity: SEVERITY.INFO,
            action: NOTIFICATION_ACTION.NODES_LOCKED,
            userId: this.ctx.user.id,
          })
        }
        this.ctx.log.verbose(
          { foldersCount: unlockedFoldersCount, filesCount: unlockedFilesCount },
          'NodesUnlockOperation: Unlocked total objects',
        )
      } catch (err) {
        this.ctx.log.error(`Error while unlocking files and folders: ${err}`)
        await notificationService.createNotification({
          message: 'Error unlocking files and folders.',
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.NODES_UNLOCKED,
          userId: this.ctx.user.id,
        })
        await rollbackUnlockingState(em, nodes)
        throw err
      }
    }
  }
}

export { NodesUnlockOperation }
