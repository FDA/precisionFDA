import { wrap } from '@mikro-orm/core'
import { difference, intersection, isNil, uniqBy } from 'ramda'
import { User } from '..'
import { Folder } from './folder.entity'

const getFolders = (pathStr: string) => pathStr.split('/').slice(1)

const getPathsToBuild = (remote: string[], local: string[]): string[] => {
  return difference(remote, local)
}

// and delete the rest
const getPathsToKeep = (remote: string[], local: string[]): string[] => {
  return intersection(local, remote)
}

const filterDuplicities = uniqBy((fol: Folder) => fol.id)

/**
 * Prepares folder paths that are fetched from the API.
 * @param response DescribeFoldersResponse
 */
const parseFoldersFromClient = (paths: string[]): string[] => {
  const folders = paths.filter((entry: string) => entry !== '/').sort((a, b) => a.localeCompare(b))
  return folders
}

// recursion step
const folderTraverse = (folders: Folder[], current: Folder, acc: string[]): string[] => {
  acc.unshift(current.name)
  if (!current.parentFolder || !current.parentFolder.id) {
    return acc
  }
  // fixme: be careful if parent is properly initialized -> so it has the id
  const parent = folders.find(folder => folder.id === current.parentFolder?.id)
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
 * Prepares folder paths from local database rows.
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
  const current = folders.concat(result).find(f => {
    const namesSame = f.name === pathStr[currentIdx]
    // const noParents = isNil(f.parentFolder) ? isNil(f.parentFolder) && isNil(parent) : false
    // if (noParents) {
    //   // both don't have a parent folder
    //   // if names match, we got it
    //   return namesSame
    // }
    return namesSame && f.parentFolder?.id === parent?.id
  })
  if (current) {
    // we know this
    createFoldersTraverse(folders, pathStr, user, current, currentIdx + 1, result)
    return result
  }
  const newFolder = new Folder(user)
  newFolder.name = pathStr[currentIdx]
  newFolder.parentFolder = !isNil(parent) ? wrap(parent).toReference() : undefined
  result.push(newFolder)
  createFoldersTraverse(folders, pathStr, user, newFolder, currentIdx + 1, result)
  return result
}

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
  const parentId = isNil(parent) ? undefined : parent.id
  const current = folders.find(
    f => f.name === approvedPathStr[currentIdx] && f.parentFolder?.id === parentId,
  )
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
}
