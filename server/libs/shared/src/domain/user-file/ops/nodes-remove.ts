import { SqlEntityManager } from '@mikro-orm/mysql'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'
import { FolderRemoveOperation } from '@shared/domain/user-file/ops/folder-remove'
import { BaseOperation } from '@shared/utils/base-operation'
import { TypeUtils } from '@shared/utils/type-utils'
import { UserOpsCtx } from '../../../types'
import { Node } from '../node.entity'
import { NodesInput } from '../user-file.input'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import { getLogger } from '../../../logger'
import { getSuccessMessage, loadNodes } from '../user-file.helper'

const rollbackRemovingState = async (em: SqlEntityManager, nodes: Node[]): Promise<void> => {
  getLogger().error(`Rolling back removing state for nodes ${nodes.length}`)
  nodes.forEach(node => {
    if (node.stiType === FILE_STI_TYPE.FOLDER) {
      node.state = null
    } else {
      node.state = FILE_STATE_DX.CLOSED
    }
  })
  await em.flush()
}

/**
 * Operation removes all files and folders specified by id in input. Operation traverses
 * also through children.
 */
class NodesRemoveOperation extends BaseOperation<UserOpsCtx, NodesInput, number> {
  async run(input: NodesInput): Promise<number> {
    getLogger().verbose(input.ids, 'Removing ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em.fork(), { ids: input.ids }, {})
    const notificationService = new NotificationService(em)

    let removedFilesCount = 0
    let removedFoldersCount = 0

    try {
      const fileRemoveOp = new FileRemoveOperation(this.ctx)
      const folderRemoveOp = new FolderRemoveOperation(this.ctx)

      for (const node of nodes) {
        if (node.stiType === FILE_STI_TYPE.USERFILE) {
          await fileRemoveOp.execute({ id: node.id })
          removedFilesCount++
        } else {
          await folderRemoveOp.execute({ id: node.id })
          removedFoldersCount++
        }
      }

      if (input.async) {
        await notificationService.createNotification({
          message: getSuccessMessage(
            removedFilesCount,
            removedFoldersCount,
            'Successfully deleted',
          ),
          severity: SEVERITY.INFO,
          action: NOTIFICATION_ACTION.NODES_REMOVED,
          userId: this.ctx.user.id,
        })
      }

      this.ctx.log.verbose(
        { foldersCount: removedFoldersCount, filesCount: removedFilesCount },
        'Removed total objects',
      )
    } catch (err) {
      if (input.async) {
        await notificationService.createNotification({
          message: TypeUtils.getPropertyValueFromUnknownObject<string>(err, 'message') ?? 'Error deleting files and folders.',
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.NODES_REMOVED,
          userId: this.ctx.user.id,
        })

        await rollbackRemovingState(em, nodes)
      }
      throw err
    }
    return removedFilesCount + removedFoldersCount
  }
}

export { NodesRemoveOperation }
