import { difference, intersection, isNil, uniqBy } from 'ramda'
import { User, Node, UserFile } from '..'
import { Folder } from './folder.entity'
import { FolderRepository } from './folder.repository'
import { FILE_STI_TYPE } from './user-file.enum'

const getStiEnumTypeFromInstance = (node: Node): FILE_STI_TYPE => {
  if (node instanceof Folder) {
    return FILE_STI_TYPE.FOLDER
  }
  if (node instanceof UserFile) {
    return FILE_STI_TYPE.USERFILE
  }
  throw new Error('Unsupported entity instance')
}

const getFolders = (pathStr: string) => pathStr.split('/').slice(1)
// Split folder path into a list of folder names

// Find the set of paths on dx platform that is not on local
const getPathsToBuild = (remote: string[], local: string[]): string[] => {
  return difference(remote, local)
}

// Find the set of paths that exists on both dx platform and pFDA db
const getPathsToKeep = (remote: string[], local: string[]): string[] => {
  return intersection(local, remote)
}

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
 * Construct a folder's absolute paths (relative to Files root folder) from local database rows.
 * This is done recursively starting from the end node and stepping up the tree reaching the root
 * folder
 * @param folders Folder[] array that contains all folders
 * @param current The current folder
 * @param acc Resultant path string
 */
const folderTraverse = (folders: Folder[], current: Folder, acc: string[]): string[] => {
  acc.unshift(current.name)
  if (!current.parentFolderId) {
    // Folder without parentFolderId, should be the root folder.
    // Unless orphaned folders are possible (unverified claim)
    return acc
  }
  // fixme: be careful if parent is properly initialized -> so it has the id
  const parent = folders.find(folder => folder.id === current.parentFolderId)
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
const parseFoldersFromDatabase = (folders: Folder[]): string[] => {
  const folderPaths = folders
    .map(folder => {
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

/**
 * Returns a filter function that checks if an element of pathStr at index currentId
 * @param parentId id of the parent node
 * @param pathStr list of path string
 * @param currentIdx index of pathStr that we should check against
 *  TODO: Wouldn't it be cleaner if we just pass in pathStr[currentIdx] ?
 */
const compareWithParentId = (
  parentId: number | undefined | null,
  pathStr: string[],
  currentIdx: number,
) => (f: Folder): boolean => {
  const sameName = f.name === pathStr[currentIdx]
  if (isNil(parentId)) {
    return sameName && isNil(f.parentFolderId)
  }
  return sameName && f.parentFolderId === parentId
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
  const current = folders.concat(result).find(compareWithParentId(parent?.id, pathStr, currentIdx))
  if (current) {
    // The folder path at pathStr[currentIdx] corresponds with an existing or already created Folder
    createFoldersTraverse(folders, pathStr, user, current, currentIdx + 1, result)
    return result
  }
  const newFolder = new Folder(user)
  newFolder.name = pathStr[currentIdx]
  newFolder.parentFolderId = !isNil(parent) ? parent.id : undefined
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
  const parentId = isNil(parent) ? null : parent.id
  const current = folders.find(compareWithParentId(parentId, approvedPathStr, currentIdx))
  if (!current) {
    throw new Error('folder name was not found in db entries')
  }
  result.push(current)
  detectIntersectedTraverse(folders, approvedPathStr, current, currentIdx + 1, result)
  return result
}

export {
  parseFoldersFromClient,
  parseFoldersFromDatabase,
  getFolders,
  createFoldersTraverse,
  detectIntersectedTraverse,
  getPathsToBuild,
  getPathsToKeep,
  filterDuplicities,
  getFolderPath,
  childrenTraverse,
  getStiEnumTypeFromInstance,
  filterLeafPaths,
}
