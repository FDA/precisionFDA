import { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { difference, intersection, isNil, uniqBy } from 'ramda'
import { User, Node, UserFile, Asset, entities } from '..'
import { AssetRepository } from './asset.repository'
import { Folder } from './folder.entity'
import { FolderRepository } from './folder.repository'
import { nodeQueryFilter, uidListInput } from './user-file.input'
import { UserFileRepository } from './user-file.repository'
import { FILE_STI_TYPE, IFileOrAsset } from './user-file.types'

const getStiEnumTypeFromInstance = (node: Node): FILE_STI_TYPE => {
  if (node instanceof Folder) {
    return FILE_STI_TYPE.FOLDER
  }
  if (node instanceof UserFile) {
    return FILE_STI_TYPE.USERFILE
  }
  throw new Error('Unsupported entity instance')
}

// Split folder path into a list of folder names
const splitFolderPath = (pathStr: string) => pathStr.split('/').slice(1)

// Find the set of paths on dx platform that is not on local
const getPathsToBuild = (remote: string[], local: string[]): string[] => difference(remote, local)

// Find the set of paths that exists on both dx platform and pFDA db
const getPathsToKeep = (remote: string[], local: string[]): string[] => intersection(local, remote)

const filterDuplicities = uniqBy((fol: Folder) => fol.id)

/**
 * Prepares folder paths that are fetched from the API.
 * Removes the root folder and sorts alphabetically
 * @param response DescribeFoldersResponse
 */
const parseFoldersFromClient = (paths: string[]): string[] => {
  const folders = paths.filter((entry: string) => entry !== '/').sort((a, b) => a.localeCompare(b))
  return folders
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
  await Promise.all(subfolders.map(sf => childrenTraverse(sf, repo, acc)))
  return acc
}

/**
 * Traverses up in the hierarchy and returns all folders up to the root.
 *
 * @param folder Folder whose parents we need
 * @param repo
 * @returns all folders above given folder
 */
const getParentFolders = async (
  folder: Folder): Promise<Folder[]> => {
  const folderTree: Folder[] = []
  if (folder.parentFolder) {
    let currentFolder: Folder | null = folder
    while (currentFolder?.parentFolder) {
      try {
        currentFolder = currentFolder.parentFolder as Folder
        // currentFolder = await repo.findOne(currentFolder.parentFolder.id)
        if (currentFolder !== null) {
          folderTree.push(currentFolder)
        }
      } catch (error) {
        throw error
      }
    }
    return folderTree
  }
  return folderTree
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
  const parent = folders.find(folder => folder.id === current.parentFolder.id)
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
  const folderPaths = folders.map(folder => {
    const chain = folderTraverse(folders, folder, [])
    return `/${chain.join('/')}`
  })
    .sort((a, b) => a.localeCompare(b))
  // todo: back to array for easier comparison?
  return folderPaths
}

const filterLeafPaths = (folderPaths: string[]): string[] => {
  // slice to remove the first "/"
  const folderPathNames = folderPaths.map(folderPath => folderPath.split('/').slice(1))
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
    .map(fp => `/${fp.join('/')}`)
}

const getFolderPath = (folders: Folder[], current: Folder): string => {
  const chain = folderTraverse(folders, current, [])
  return `/${chain.join('/')}`
}


const createNameAndParentIdFilter = (
  folderName: string,
  parent: Folder | undefined,
) => (f: Folder ): boolean => {
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
  const current = folders.concat(result).find(createNameAndParentIdFilter(pathStr[currentIdx], parent))
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

const findFileOrAssetWithUid = async (
  em: EntityManager,
  uid: string,
): Promise<IFileOrAsset | null> => {
  const userFileRepo = em.getRepository(UserFile) as UserFileRepository
  const file = await userFileRepo.findFileWithUid(uid, ['user', 'challengeResources'])
  if (file) {
    return file
  }

  const assetRepo = em.getRepository(Asset) as AssetRepository
  return await assetRepo.findAssetWithUid(uid)
}

const findUnclosedFilesOrAssets = async (
  em: EntityManager,
  userId: number,
): Promise<IFileOrAsset[]> => {
  let results: IFileOrAsset[] = []
  const userFileRepo = em.getRepository(UserFile)
  const assetRepo = em.getRepository(Asset)
  results = results.concat(await userFileRepo.findUnclosedFiles(userId))
  results = results.concat(await assetRepo.findUnclosedAssets(userId))
  return results
}


/**
 * Method recursively collects all children of given node if it's a folder.
 */
const collectChildren = async (parentFolder: Folder, wholeTree: Node[], em: SqlEntityManager) => {
  await parentFolder.children.init()
  for (const childrenNode of parentFolder.children) {
    if (childrenNode.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(childrenNode as Folder, wholeTree, em)
    } else {
      wholeTree.push(childrenNode)
    }
  }
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
const loadNodes = async (em: any, input: uidListInput, filters: nodeQueryFilter) => {
  const nodes: Node[] = await em.find(entities.Node, {
    $or: [
      {
        id: { $in: input.ids },
        ...filters,
      },
      {
        scopedParentFolderId: { $in: input.ids },
        ...filters,
      },
    ],
  })
  await em.populate(nodes, ['parentFolder'])
  const wholeTree: Node[] = []
  for (const node of nodes) {
    if (node.stiType === FILE_STI_TYPE.FOLDER) {
      await collectChildren(node as Folder, wholeTree, em)
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


export {
  parseFoldersFromClient,
  folderPathsFromFolders,
  splitFolderPath,
  createFoldersTraverse,
  detectIntersectedTraverse,
  getPathsToBuild,
  getPathsToKeep,
  filterDuplicities,
  getFolderPath,
  childrenTraverse,
  getParentFolders,
  getStiEnumTypeFromInstance,
  filterLeafPaths,
  findFolderForPath,
  findFileOrAssetWithUid,
  findUnclosedFilesOrAssets,
  loadNodes,
}
