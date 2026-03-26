import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE, FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import sanitize from 'sanitize-filename'

interface FilesByFolder {
  [key: string]: Node[]
}

/**
 * Component that should contain helper methods for nodes.
 * TODO Ideally this should contain all functions from user-file.helper.
 */
@Injectable()
export class NodeHelper {

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly folderRepo: FolderRepository,
    private readonly nodeRepo: NodeRepository,
  ) {}

  async generateUid(dxId: DxId<'file'>): Promise<Uid<'file'>> {
    const allNodes = await this.nodeRepo.find({ dxid: dxId } as Partial<Node>, {
      orderBy: { uid: 'DESC' },
      limit: 1,
    })

    if (allNodes.length > 0) {
      const latestUid = allNodes[0].uid
      const match = latestUid.match(/^(.*-)(\d+)$/)
      if (match) {
        const prefix = match[1]
        const num = parseInt(match[2], 10)
        return `${prefix}${num + 1}` as Uid<'file'>
      }
    }

    return `${dxId}-1` as Uid<'file'>
  }

  async findOldOpenFilesAndAssets(): Promise<FileOrAsset[]> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    return (await this.nodeRepo.find({
      user: this.userCtx.id,
      stiType: { $in: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET] },
      state: FILE_STATE_DX.OPEN,
      createdAt: { $lt: oneMonthAgo },
    })) as FileOrAsset[]
  }

  async findOldClosingFilesAndAssets(): Promise<FileOrAsset[]> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    return (await this.nodeRepo.find({
      user: this.userCtx.id,
      stiType: { $in: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET] },
      state: FILE_STATE_DX.CLOSING,
      createdAt: { $lt: oneMonthAgo },
    })) as FileOrAsset[]
  }

  async findRecentClosingFilesAndAssets(): Promise<FileOrAsset[]> {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    return (await this.nodeRepo.find({
      user: this.userCtx.id,
      stiType: { $in: [FILE_STI_TYPE.USERFILE, FILE_STI_TYPE.ASSET] },
      state: FILE_STATE_DX.CLOSING,
      createdAt: { $gte: oneMonthAgo },
    })) as FileOrAsset[]
  }

  async filterNodesByUser(nodes: Node[]): Promise<Node[]> {
    for (const node of nodes) {
      if (node.isInSpace()) {
        const spaceId = node.getSpaceId()
        const space = await this.em.findOneOrFail(Space, spaceId, {
          populate: ['spaceMemberships', 'spaceMemberships.user'],
        })
        const leadMemberships = space.spaceMemberships
          .getItems()
          .find(
            (membership) =>
              membership.role === SPACE_MEMBERSHIP_ROLE.LEAD &&
              membership.user.id === this.userCtx.id,
          )
        if (leadMemberships) {
          return nodes
        }
        if (!leadMemberships) {
          throw new Error(`You have no permissions to lock or unlock '${node.name}'.`)
        }
      } else {
        return nodes.filter((innerNode) => innerNode.user.id === this.userCtx.id)
      }
    }

    return nodes
  }

  /**
   * Method recursively collects all children of given node if it's a folder.
   */
  async collectChildren(parentFolder: Folder, wholeTree: Node[]): Promise<void> {
    const relations = parentFolder.isInSpace() ? 'scopedChildren' : 'nonScopedChildren'
    const folderWithChildren = await this.folderRepo.findOne(parentFolder.id, {
      populate: [relations],
    })

    if (!folderWithChildren?.folderPath?.length) {
      // only called for root folder
      const parentNode = this.getParentFolder(folderWithChildren)
      folderWithChildren.folderPath = parentNode ? `${await this.getNodePath(parentNode)}/` : '/'
    }
    for (const childrenNode of folderWithChildren.children) {
      childrenNode.folderPath = `${folderWithChildren.folderPath}${folderWithChildren.name}/`
      if (childrenNode.stiType === FILE_STI_TYPE.FOLDER) {
        await this.collectChildren(childrenNode as Folder, wholeTree)
      } else {
        wholeTree.push(childrenNode)
      }
    }
    // TODO(PFDA-5325): remove this line to avoid adding folder items
    wholeTree.push(folderWithChildren)
  }

  async getFolderPath(folderId?: number): Promise<string> {
    if (!folderId) {
      return null
    }
    const enclosingFolder = await this.nodeRepo.findOneOrFail({ id: folderId })
    return await this.getNodePath(enclosingFolder)
  }

  async getNodePath(node: Node, folders: string[] | undefined = []): Promise<string> {
    folders.unshift(node.name)
    const parentFolderNode = this.getParentFolder(node)
    if (!parentFolderNode) {
      // we have reached root, compose the path and return it
      return `/${folders.join('/')}`
    }
    const parentFolder = await this.folderRepo.findOne({ id: parentFolderNode.id })

    return this.getNodePath(parentFolder as Node, folders)
  }

  /**
   * Returns parentFolder if scope is private, public or null, otherwise it returns scopedParentFolder
   * @param node
   */
  getParentFolder(node: Node): Node {
    if (
      [STATIC_SCOPE.PUBLIC.toString(), STATIC_SCOPE.PRIVATE.toString(), null].includes(node.scope)
    ) {
      return node.parentFolder
    }
    return node.scopedParentFolder
  }

  /**
   * Returns a string with warnings for unclosed files.
   * @param nodesToCheck
   */
  getWarningsForUnclosedFiles(nodesToCheck: Node[]): string {
    // Collect names of unclosed files
    const unclosedFileNames = nodesToCheck
      .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE && node.state !== 'closed')
      .map((node) => `'${node.name}'`)

    // Check if there are any unclosed files
    if (unclosedFileNames.length === 0) {
      return null
    } else {
      // Join the file names and construct the warning message
      const fileList = unclosedFileNames.join(', ')
      return `Warning: The following files couldn't be attached in the download: ${fileList}.`
    }
  }

  /**
   * Sanitizes the names of the nodes.
   * @param nodes
   */
  sanitizeNodeNames(nodes: (Asset | UserFile)[]): (Asset | UserFile)[] {
    return nodes.map((node) => {
      const sanitizedNode = { ...node } as Asset | UserFile
      sanitizedNode.name = sanitize(node.name)
      return sanitizedNode
    })
  }

  private renameFile: (name: string, index: number) => string = (name: string, index: number) => {
    const dotIndex = name.lastIndexOf('.')
    if (dotIndex !== -1) {
      // Insert index before the extension
      return `${name.substring(0, dotIndex)} ${index}${name.substring(dotIndex)}`
    }
    // No extension found, append index to the end
    return `${name} ${index}`
  }

  /**
   * Renames duplicate files in the same folder. First file is not renamed.
   * Second file is renamed to "name 1", third to "name 2" and so on.
   * @param nodes
   */
  renameDuplicateFiles(nodes: (Asset | UserFile)[]): (Asset | UserFile)[] {
    // Group files by their parentFolderId
    const filesByFolder = nodes.reduce<FilesByFolder>((acc, node) => {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        return acc
      }
      const folderId = node.parentFolder === null ? 'root' : node.parentFolder.id.toString()
      if (!acc[folderId]) {
        acc[folderId] = []
      }
      acc[folderId].push(node)
      return acc
    }, {})

    // Process each group to find and rename duplicates
    Object.values(filesByFolder).forEach((group) => {
      const nameCounts: { [key: string]: number } = {}

      group.forEach((node) => {
        let name = node.name
        if (nameCounts[name]) {
          // Duplicate found, rename it
          let newName: string
          do {
            newName = this.renameFile(name, nameCounts[name])
            nameCounts[name] = nameCounts[name] + 1 || 1 // Increment the count for the original name
          } while (nameCounts[newName])
            // Ensure the new name is also unique within the folder
            name = newName
        }
        nameCounts[name] = (nameCounts[name] || 0) + 1 // Initialize or increment the count for the new/unique name
        node.name = name // Update the node's name
      })
    })

    return nodes
  }
}
