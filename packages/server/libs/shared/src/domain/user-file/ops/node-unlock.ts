import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { FileUnlockOperation } from '@shared/domain/user-file/ops/file-unlock'
import { FolderUnlockOperation } from '@shared/domain/user-file/ops/folder-unlock'
import { User } from '@shared/domain/user/user.entity'
import { PermissionError } from '@shared/errors'
import { getLogger } from '@shared/logger'
import { BaseOperation } from '@shared/utils/base-operation'
import { Node } from '../node.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { UserOpsCtx } from '@shared/types'
import { filterNodesByUser, getSuccessMessage, loadNodes } from '../user-file.helper'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { SqlEntityManager } from '@mikro-orm/mysql'

const rollbackUnlockingState = async (em: SqlEntityManager, nodes: Node[]): Promise<void> => {
  getLogger().error(`Rolling back unlocking state for ${nodes.length} nodes`)
  nodes.forEach((node) => {
    node.locked = true
    node.state = FILE_STATE_DX.CLOSED
  })
  await em.flush()
}

class NodesUnlockOperation extends BaseOperation<UserOpsCtx, NodesInputDTO, void> {
  async run(input: NodesInputDTO): Promise<void> {
    this.ctx.log.log(input.ids, 'Unlocking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: true })
    const notificationService = new NotificationService(em)
    const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
    const filteredNodes = await filterNodesByUser(em, nodes, currentUser)
    let unlockedFilesCount = 0
    let unlockedFoldersCount = 0
    if (filteredNodes?.length) {
      try {
        const fileUnlockOp = new FileUnlockOperation(this.ctx)
        const folderUnlockOp = new FolderUnlockOperation(this.ctx)

        for (const node of filteredNodes) {
          if (node.stiType === FILE_STI_TYPE.ASSET) {
            // TODO What? unlocking asset is not allowed?
            this.ctx.log.error(
              `NodesUnlockOperation: Unlocking of asset  ${node.uid} is not allowed`,
            )
            throw new PermissionError(`Unlocking of asset  ${node.uid} is not allowed`)
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
        this.ctx.log.log(
          { foldersCount: unlockedFoldersCount, filesCount: unlockedFilesCount },
          'Unlocked total objects',
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
