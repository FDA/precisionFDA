import { BaseOperation } from '../../../utils'
import { Node } from '../node.entity'
import { uidListInput } from '../user-file.input'
import { FILE_STI_TYPE } from '../user-file.types'
import { UserOpsCtx } from '../../../types'
import { errors } from '../../..'
import { userFile } from '../..'
import { loadNodes } from '../user-file.helper'

class NodesUnlockOperation extends BaseOperation<UserOpsCtx, uidListInput, void> {
  async run(input: uidListInput): Promise<void> {
    this.ctx.log.info(input.ids, 'NodesUnlockOperation: Unlocking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: true })
    let unlockedFilesCount = 0
    let unlockedFoldersCount = 0

    try {
      const fileUnlockOp = new userFile.FileUnlockOperation(this.ctx)
      const folderUnlockOp = new userFile.FolderUnlockOperation(this.ctx)

      for (const node of nodes) {
        if (node.stiType === FILE_STI_TYPE.ASSET) {
          this.ctx.log.error(`NodesUnlockOperation: Unlocking of asset  ${node.uid} is not allowed`)
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

      this.ctx.log.info(
        { foldersCount: unlockedFoldersCount, filesCount: unlockedFilesCount },
        'NodesUnlockOperation: Unlocked total objects',
      )
    } catch (err) {
      throw err
    }
  }
}

export { NodesUnlockOperation }
