import { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Space } from '@shared/domain/space/space.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { difference, isNil } from 'ramda'
import { STATIC_SCOPE } from '../../enums'
import { PermissionError } from '../../errors'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { CAN_EDIT_ROLES } from '../space-membership/space-membership.helper'
import { SPACE_STATE, SPACE_TYPE } from '../space/space.enum'
import { getIdFromScopeName, scopeContainsId } from '../space/space.helper'
import { Asset } from './asset.entity'
import { AssetRepository } from './asset.repository'
import { FolderRepository } from './folder.repository'
import { IdsInput, nodeQueryFilter } from './user-file.input'
import { UserFileRepository } from './user-file.repository'
import { FILE_STI_TYPE, IFileOrAsset } from './user-file.types'

// Split folder path into a list of folder names
const splitFolderPath = (pathStr: string) => pathStr.split('/').slice(1)

// Find the set of paths on dx platform that is not on local
const getPathsToBuild = (remote: string[], local: string[]): string[] => difference(remote, local)

/**
 * Prepares folder paths that are fetched from the API.
 * Removes the root folder and sorts alphabetically
 */
const parseFoldersFromClient = (paths: string[]): string[] => {
  return paths.filter((entry: string) => entry !== '/').sort((a, b) => a.localeCompare(b))
}

const childrenTraverse = async (
  folder: Folder,
  repo: FolderRepository,
  acc: Folder[],
): Promise<Folder[]> => {
  // fixme: if there is a loop in folder ids, it will crash hard
  // could be easily prevented -> return if id already exists in acc
  acc.push(folder)
  const subfolders = await repo.findChildren({ parentFolderId: folder.id })
  await Promise.all(subfolders.map((sf) => childrenTraverse(sf, repo, acc)))
  return acc
}

/**
 * Construct a folder's absolute paths (relative to Files root folder) from local database rows.
 * This is done recursively starting from the end node and stepping up the tree reaching the root
 * folder
 * @param folders Folder[] array that contains all folders
 * @param current The current folder
 * @param acc Resultant path string
 */
const folderTraverse = (folders: Folder[], current: Folder, acc: string[]): string[] => {
  acc.unshift(current.name)
  if (!current.parentFolder) {
    // Folder without parentFolderId, should be the root folder.
    // Unless orphaned folders are possible (unverified claim)
    return acc
  }
  // fixme: be careful if parent is properly initialized -> so it has the id
  const parent = folders.find((folder) => folder.id === current.parentFolder.id)
  if (parent && parent.id === current.id) {
    throw new Error('parent folder equals current, error in data')
  }
  if (!parent) {
    // prevents setting "current" to null
    return acc
  }
  folderTraverse(folders, parent, acc)
  return acc
}

/**
 * Returns a list of folder absolute paths (relative to Files root folder) from a list of database Folder rows.
 * Sorted by name
 * @param folders Folder[]
 */
const folderPathsFromFolders = (folders: Folder[]): string[] => {
  // todo: back to array for easier comparison?
  return folders
    .map((folder) => {
      const chain = folderTraverse(folders, folder, [])
      return `/${chain.join('/')}`
    })
    .sort((a, b) => a.localeCompare(b))
}

const filterLeafPaths = (folderPaths: string[]): string[] => {
  // slice to remove the first "/"
  const folderPathNames = folderPaths.map((folderPath) => folderPath.split('/').slice(1))
  return folderPathNames
    .filter((fp, idx) => {
      const isIncluded = folderPathNames.some((tp, innerIdx) => {
        if (idx === innerIdx) {
          // we are not interested in this, passing through
          return false
        }
        if (fp.length > tp.length) {
          // fp cannot be substring of tp because fp is longer
          return false
        }
        // every item in fp equals to something in given tp
        return fp.every((fpItem, fpInnerIdx) => fpItem === tp[fpInnerIdx])
      })
      return !isIncluded
    })
    .map((fp) => `/${fp.join('/')}`)
}

const getFolderPath = (folders: Folder[], current: Folder): string => {
  const chain = folderTraverse(folders, current, [])
  return `/${chain.join('/')}`
}

const createNameAndParentIdFilter =
  (folderName: string, parent: Folder | undefined) =>
  (f: Folder): boolean => {
    const sameName = f.name === folderName
    if (isNil(parent)) {
      return sameName && isNil(f.parentFolder)
    }
    return sameName && f.parentFolder && f.parentFolder.id === parent.id
  }

/**
 * Recursively finds folders specified in 'pathStr' that are not found in 'folders'
 * @param folders List of existing folders retrieved from the database
 * @param pathStr List of subfolder names ordered from parent folder to subfolder
 * @param user User object
 * @param parent Parent Folder object
 * @param currentIdx Current index of pathStr
 * @param result resultant Folder[] list
 * @returns a list of Folders to be created on the database
 */
const createFoldersTraverse = (
  folders: Folder[],
  pathStr: string[],
  user: User,
  parent: Folder | undefined,
  currentIdx: number,
  result: Folder[],
): Folder[] => {
  if (currentIdx === pathStr.length) {
    return folders
  }
  if (parent && isNil(parent.id)) {
    // todo: log or throw error
    console.log('parent is not yet persisted! Might not create subfolders properly', parent.name)
  }
  const current = folders
    .concat(result)
    .find(createNameAndParentIdFilter(pathStr[currentIdx], parent))
  if (current) {
    // The folder path at pathStr[currentIdx] corresponds with an existing or already created Folder
    createFoldersTraverse(folders, pathStr, user, current, currentIdx + 1, result)
    return result
  }
  const newFolder = new Folder(user)
  newFolder.name = pathStr[currentIdx]
  if (!isNil(parent)) {
    newFolder.parentFolder = parent
  }
  result.push(newFolder)
  createFoldersTraverse(folders, pathStr, user, newFolder, currentIdx + 1, result)
  return result
}

/**
 *
 * @param folders list of Folder database objects
 * @param approvedPathStr list of folder names
 * @param parent parent folder
 * @param currentIdx index of 'approvedPathStr' to be examined
 * @param result Reference to the running result, returned to caller
 */
const detectIntersectedTraverse = (
  folders: Folder[],
  approvedPathStr: string[],
  parent: Folder | undefined,
  currentIdx: number,
  result: Folder[],
): Folder[] => {
  if (currentIdx === approvedPathStr.length) {
    return result
  }
  const current = folders.find(createNameAndParentIdFilter(approvedPathStr[currentIdx], parent))
  if (!current) {
    throw new Error('folder name was not found in db entries')
  }
  result.push(current)
  detectIntersectedTraverse(folders, approvedPathStr, current, currentIdx + 1, result)
  return result
}

// This is a replacement for detectIntersectedTraverse
// TODO: Remove detectIntersectedTraverse if the following replacement works in all cases, but not before veriying
/**
 * findFolderForPath
 *
 * This is a recursive function to find the Folder object pertaining to the path described by folderPathComponents
 * It expects a path split of the target folder, /foo/bar/stu -> ['foo', 'bar', 'stu']
 * On first recursion it looks for the Folder with name 'foo', followed by Folder with name 'bar' whose parent is 'foo'
 * and so forth until the last path component ('stu') is processed
 *
 * @param folders list of all available Folders database objects, as the source of lookup
 * @param folderPathComponents folder path components of the folder
 * @param parent parent folder, for first invocation this should be undefined
 * @returns Folder that is defined by the folderPathComponents
 */
const findFolderForPath = (
  folders: Folder[],
  folderPathComponents: string[],
  parent: Folder | undefined,
): Folder | undefined => {
  const folderName = folderPathComponents[0]

  const currentFolder = folders.find(createNameAndParentIdFilter(folderName, parent))
  if (!currentFolder) {
    throw new Error(`Folder ${folderName} was not found in db entries`)
  }

  if (folderPathComponents.length > 1) {
    folderPathComponents.shift()
    return findFolderForPath(folders, folderPathComponents, currentFolder)
  }

  return currentFolder
}

/**
 * Returns parentFolder if scope is private, public or null, otherwise it returns scopedParentFolder
 * @param node
 */
export const getParentFolder = (node: Node) => {
  if (
    [STATIC_SCOPE.PUBLIC.toString(), STATIC_SCOPE.PRIVATE.toString(), null].includes(node.scope)
  ) {
    return node.parentFolder
  }
  return node.scopedParentFolder
}

const getNodePath = async (
  em: SqlEntityManager,
  node: Node,
  folders: string[] | undefined = [],
): Promise<string> => {
  folders.unshift(node.name)
  const parentFolderNode = getParentFolder(node)
  if (!parentFolderNode) {
    // we have reached root, compose the path and return it
    return `/${folders.join('/')}`
  }
  const folderRepo = em.getRepository(Folder)
  const parentFolder = await folderRepo.findOne({ id: parentFolderNode.id })
  return getNodePath(em, parentFolder as Node, folders)
}

const validateVerificationSpace = async (em: SqlEntityManager, node: Node): Promise<void> => {
  if (node.scope && node.scope.startsWith('space')) {
    const spaceId = getIdFromScopeName(node.scope)
    const space = await em.findOneOrFail(Space, { id: spaceId })
    if (space.type === SPACE_TYPE.VERIFICATION && space.state === SPACE_STATE.LOCKED) {
      throw new Error(
        `You have no permissions to remove ${node.name} as` +
          ' it is part of Locked Verification space.',
      )
    }
  }
}

/**
 * Validates for Protected Spaces. If node is in protected space then
 * given userId needs to be in a lead role otherwise error is thrown.
 *
 * @param em EntityManager instance
 * @param action action that is to be performed on the node (for possible validation error message)
 * @param userId current user
 * @param node node that is being verified
 */
const validateProtectedSpaces = async (
  em: SqlEntityManager,
  action: string,
  userId: number,
  node: Node,
) => {
  if (scopeContainsId(node.scope)) {
    const spaceId = getIdFromScopeName(node.scope)
    const space = await em.findOneOrFail(Space, spaceId, {
      populate: ['spaceMemberships', 'spaceMemberships.user'],
    })
    if (space.protected) {
      const leadMemberships = space.spaceMemberships
        .getItems()
        .find(
          (membership) =>
            membership.role === SPACE_MEMBERSHIP_ROLE.LEAD && membership.user.id === userId,
        )
      if (!leadMemberships) {
        throw new Error(`You have no permissions to ${action} from a Protected Space`)
      }
    }
  }
}

const validateEditableBy = async (em: SqlEntityManager, node: Node, currentUser: User) => {
  if (node.locked) {
    throw new Error('Locked items cannot be removed.')
  }
  if (
    node.scope === STATIC_SCOPE.PUBLIC ||
    node.user.id === currentUser.id ||
    (await currentUser.isSiteAdmin())
  ) {
    return
  }
  if (scopeContainsId(node.scope)) {
    const spaceId = getIdFromScopeName(node.scope)
    const space = await em.findOne(Space, {
      id: spaceId,
      state: SPACE_STATE.ACTIVE,
      spaceMemberships: {
        user: {
          id: currentUser.id,
        },
        role: CAN_EDIT_ROLES,
      },
    })
    if (space) return
  }
  throw new PermissionError(`You have no permissions to remove '${node.name}'.`)
}

const filterNodesByUser = async (em: SqlEntityManager, nodes: Node[], currentUser: User) => {
  for (const node of nodes) {
    if (scopeContainsId(node.scope)) {
      const spaceId = getIdFromScopeName(node.scope)
      const space = await em.findOneOrFail(Space, spaceId, {
        populate: ['spaceMemberships', 'spaceMemberships.user'],
      })
      const leadMemberships = space.spaceMemberships
        .getItems()
        .find(
          (membership) =>
            membership.role === SPACE_MEMBERSHIP_ROLE.LEAD && membership.user.id === currentUser.id,
        )
      if (leadMemberships) {
        return nodes
      }
      if (!leadMemberships) {
        throw new Error(`You have no permissions to lock or unlock '${node.name}'.`)
      }
    } else {
      return nodes.filter((innerNode) => innerNode.user.id === currentUser.id)
    }
  }

  return nodes
}
const findFileOrAssetWithUid = async (
  em: EntityManager,
  uid: Uid<'file'>,
): Promise<IFileOrAsset | null> => {
  const userFileRepo = em.getRepository(UserFile) as UserFileRepository
  const file = await userFileRepo.findFileWithUid(uid, ['user', 'challengeResources'])
  if (file) {
    return file as IFileOrAsset
  }

  const assetRepo = em.getRepository(Asset) as AssetRepository
  return (await assetRepo.findAssetWithUid(uid)) as IFileOrAsset
}

const findFileOrAssetsWithDxid = async (
  em: EntityManager,
  dxid: DxId<'file'>,
): Promise<IFileOrAsset[]> => {
  const userFileRepo = em.getRepository(UserFile) as UserFileRepository
  const res = await userFileRepo.findFilesWithDxid(dxid)
  if (res.length > 0) {
    return res as IFileOrAsset[]
  }

  const assetRepo = em.getRepository(Asset) as AssetRepository
  return (await assetRepo.findAllAssetsWithDxid(dxid)) as IFileOrAsset[]
}

const findUnclosedFilesOrAssets = async (
  em: EntityManager,
  userId: number,
): Promise<IFileOrAsset[]> => {
  let results: IFileOrAsset[] = []
  const userFileRepo = em.getRepository(UserFile)
  const assetRepo = em.getRepository(Asset)
  results = results.concat((await userFileRepo.findUnclosedFiles(userId)) as IFileOrAsset[])
  results = results.concat((await assetRepo.findUnclosedAssets(userId)) as IFileOrAsset[])
  return results
}

/**
 * Method recursively collects all children of given node if it's a folder.
 */
const collectChildren = async (parentFolder: Folder, wholeTree: Node[], em: SqlEntityManager) => {
  await parentFolder.children.init()
  if (!parentFolder?.folderPath?.length) {
    // only called for root folder
    const parentNode = getParentFolder(parentFolder)
    parentFolder.folderPath = parentNode ? `${await getNodePath(em, parentNode)}/` : '/'
  }
  for (const childrenNode of parentFolder.children) {
    childrenNode.folderPath = `${parentFolder.folderPath}${parentFolder.name}/`
    if (childrenNode.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(childrenNode as Folder, wholeTree, em)
    } else {
      wholeTree.push(childrenNode)
    }
  }
  // TODO(PFDA-5325): remove this line to avoid adding folder items
  wholeTree.push(parentFolder)
}

/**
 * Loads the whole tree that is filtered by parameters and returns
 * it sorted with leaves first
 *
 * @param em
 * @param input
 * @param filters
 * @returns
 */
const loadNodes = async (em: SqlEntityManager, input: IdsInput, filters: nodeQueryFilter) => {
  const nodes: Node[] = await em.find(Node, {
    $or: [
      {
        id: { $in: input.ids },
        ...filters,
      },
      {
        scopedParentFolder: { $in: input.ids },
        ...filters,
      },
    ],
  })
  await em.populate(nodes, ['parentFolder', 'scopedParentFolder'])
  const wholeTree: Node[] = []
  for (const node of nodes) {
    if (node.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(node as Folder, wholeTree, em)
    } else {
      wholeTree.push(node)
    }
  }
  // ensure uniqueness
  const unique = [...new Map(wholeTree.map((item) => [item.id, item])).values()]
  // sort all nodes, folders last
  unique.sort((a, b) => (a.isFolder && b.isFolder ? 0 : b.isFolder ? -1 : 1))
  return unique
}

const getPluralizedTerm = (itemCount: number, itemName: string): string => {
  if (itemCount === 1) {
    return `${itemCount.toString()} ${itemName}`
  }
  return `${itemCount.toString()} ${itemName}s`
}

const getSuccessMessage = (filesCount: number, foldersCount: number, message: string) => {
  if (foldersCount > 0 && filesCount === 0) {
    return `${message} ${getPluralizedTerm(foldersCount, 'folder')}`
  } else if (filesCount > 0 && foldersCount === 0) {
    return `${message} ${getPluralizedTerm(filesCount, 'file')}`
  }
  return (
    `${message} ${getPluralizedTerm(filesCount, 'file')} and ` +
    `${getPluralizedTerm(foldersCount, 'folder')}`
  )
}

export {
  childrenTraverse,
  collectChildren,
  createFoldersTraverse,
  detectIntersectedTraverse,
  filterLeafPaths,
  filterNodesByUser,
  findFileOrAssetsWithDxid,
  findFileOrAssetWithUid,
  findFolderForPath,
  findUnclosedFilesOrAssets,
  folderPathsFromFolders,
  getFolderPath,
  getNodePath,
  getPathsToBuild,
  getSuccessMessage,
  loadNodes,
  parseFoldersFromClient,
  splitFolderPath,
  validateEditableBy,
  validateProtectedSpaces,
  validateVerificationSpace,
}