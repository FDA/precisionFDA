import { SqlEntityManager } from '@mikro-orm/mysql'
import { BaseOperation } from '../../../utils/base-operation'
import { UserOpsCtx } from '../../../types'
import { Node } from '../node.entity'
import { RemoveNodesInput } from '../user-file.input'
import { userFile } from '../..'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import { getLogger } from '../../../logger'
import { loadNodes } from '../user-file.helper'
import { NotificationService } from '../../notification/services/notification.service'

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

const getPluralizedTerm = (itemCount: number, itemName: string): string => {
  if (itemCount === 1) {
    return `${itemCount.toString()} ${itemName}`
  }
  return `${itemCount.toString()} ${itemName}s`
}

const getSuccessMessage = (filesCount: number, foldersCount: number) => {
  const message = 'Successfully deleted'
  if (foldersCount > 0 && filesCount === 0) {
    return `${message} ${getPluralizedTerm(foldersCount, 'folder')}`
  } else if (filesCount > 0 && foldersCount === 0) {
    return `${message} ${getPluralizedTerm(filesCount, 'file')}`
  }
  return `${message} ${getPluralizedTerm(filesCount, 'file')} and `
    + `${getPluralizedTerm(foldersCount, 'folder')}`
}

/**
 * Operation removes all files and folders specified by id in input. Operation traverses
 * also through children.
 */
class NodesRemoveOperation extends BaseOperation<UserOpsCtx, RemoveNodesInput, number> {
  async run(input: RemoveNodesInput): Promise<number> {
    getLogger().info(input.ids, 'Removing ids')
    const em = this.ctx.em.fork()
    const nodes: Node[] = await loadNodes(em, { ids: input.ids }, {})
    const notificationService = new NotificationService(em)

    let removedFilesCount = 0
    let removedFoldersCount = 0

    try {
      const fileRemoveOp = new userFile.FileRemoveOperation(this.ctx)
      const folderRemoveOp = new userFile.FolderRemoveOperation(this.ctx)

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
          message: getSuccessMessage(removedFilesCount, removedFoldersCount),
          severity: SEVERITY.INFO,
          action: NOTIFICATION_ACTION.NODES_REMOVED,
          userId: this.ctx.user.id,
        })
      }

      this.ctx.log.info(
        { foldersCount: removedFoldersCount, filesCount: removedFilesCount },
        'Removed total objects',
      )
    } catch (err) {
      if (input.async) {
        await notificationService.createNotification({
          message: 'Error deleting files and folders.',
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
