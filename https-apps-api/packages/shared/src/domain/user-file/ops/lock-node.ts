import { SqlEntityManager } from '@mikro-orm/mysql'
import { entities, Folder, UserFile, userFile } from '../..'
import { BaseOperation } from '../../../utils'
import { Node } from '../node.entity'
import { uidListInput } from '../user-file.input'
import { FILE_STI_TYPE } from '../user-file.types'
import { errors } from '../../..'
import { UserOpsCtx } from '../../../types'
import { childrenTraverse } from '../user-file.helper'
import { FolderRepository } from '../folder.repository'
import { UserFileRepository } from '../user-file.repository'

export const collectChildren = async (parentFolder: Node, wholeTree: Node[], em: SqlEntityManager) => {
  const parentFolderTest = parentFolder as Folder
  const repo = em.getRepository(Folder) as FolderRepository
  const userFileRepo = em.getRepository(UserFile) as UserFileRepository
  const folderSubtree = await childrenTraverse(parentFolderTest, repo, [])
  const filesToLock = await userFileRepo.findFilesInFolders({
    folderIds: folderSubtree.map(f => f.id),
  })
  for (const childrenNode of filesToLock) {
    if (childrenNode.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(childrenNode, wholeTree, em)
    } else {
      wholeTree.push(childrenNode)
    }
  }
  wholeTree.push(parentFolder)
}

export const loadNodes = async (em, input: uidListInput, locked: boolean) => {
  const nodes: Node[] = await em.find(entities.Node, { id: { $in: input.ids }, locked })
  const wholeTree: Node[] = []
  for (const node of nodes) {
    if (node.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(node, wholeTree, em)
    } else {
      wholeTree.push(node)
    }
  }
  // ensure uniqueness
  const unique = [...new Map(wholeTree.map(item => [item.id, item])).values()]
  // sort all nodes by id, leafs first
  unique.sort((a, b) => b.id - a.id)
  return unique
}

class NodesLockOperation extends BaseOperation<UserOpsCtx, uidListInput, void> {
  async run(input: uidListInput): Promise<void> {
    this.ctx.log.info(input.ids, 'Locking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, false)

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
        'Locked total objects',
      )
    } catch (err) {
      throw err
    }
  }
}

export { NodesLockOperation }
