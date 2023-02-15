import { userFile } from '../..'
import { BaseOperation } from '../../../utils'
import { Node } from '../node.entity'
import { uidListInput } from '../user-file.input'
import { FILE_STI_TYPE } from '../user-file.types'
import { errors } from '../../..'
import { UserOpsCtx } from '../../../types'
import { loadNodes } from '../user-file.helper'

class NodesLockOperation extends BaseOperation<UserOpsCtx, uidListInput, void> {
  async run(input: uidListInput): Promise<void> {
    this.ctx.log.info(input.ids, 'NodesLockOperation: Locking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: false })

    let lockedFilesCount = 0
    let lockedFoldersCount = 0
    try {
      const fileLockOp = new userFile.FileLockOperation(this.ctx)
      const folderLockOp = new userFile.FolderLockOperation(this.ctx)
      for (const node of nodes) {
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

      this.ctx.log.info(
        { foldersCount: lockedFoldersCount, filesCount: lockedFilesCount },
        'NodesLockOperation: Locked total objects',
      )
    } catch (err) {
      throw err
    }
  }
}

export { NodesLockOperation }
