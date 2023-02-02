import { differenceWith } from 'ramda'
import { BaseOperation } from '../../../utils'
import { Folder } from '../folder.entity'
import { SyncFoldersInput } from '../user-file.input'
import { getPathsToBuild,
  folderPathsFromFolders,
  parseFoldersFromClient,
  splitFolderPath,
  createFoldersTraverse,
  detectIntersectedTraverse,
  getPathsToKeep,
  filterDuplicities,
  getFolderPath, getParentFolders } from '../user-file.helper'
import { User, UserFile } from '../..'
import { errors } from '../../..'
import { FILE_ORIGIN_TYPE } from '../user-file.types'
import { UserOpsCtx } from '../../../types'
import { createFolderEvent, EVENT_TYPES } from '../../event/event.helper'

// todo: maybe another operation type for "can be called from another operation"

// Operation sychronizing the folder structure of a dx project to the pfda database
// Comparison of equivalent folders is done by comparing their full paths
// Contents of newly created folders (those that exist on dx platform but not pfda) are not synchronized
// by this operation, but it would remove files contained within deleted folders on the pfda side
export class SyncFoldersOperation extends BaseOperation<
UserOpsCtx,
SyncFoldersInput,
Folder[]
> {
  async run(input: SyncFoldersInput): Promise<Folder[]> {
    const em = this.ctx.em
    const user = await em.findOne(User, { id: this.ctx.user.id })
    if (!user) {
      throw new errors.UserNotFoundError()
    }
    const repo = em.getRepository(Folder)

    // cleanup the input
    const remoteFolderPaths = parseFoldersFromClient(input.remoteFolderPaths)
    const localFolders = await repo.findForSynchronization({
      userId: user.id,
      projectDxid: input.projectDxid,
    })
    const localFolderPaths = folderPathsFromFolders(localFolders)
    this.ctx.log.info({
      localFolderPathsCount: localFolderPaths.length,
      remoteFolderPathsCount: remoteFolderPaths.length,
    }, 'SyncFoldersOperation: Comparing local (pFDA) and remote (platform) folders count')

    // Discover newly created folders on dx project and create equivalent folders
    // on the pFDA database
    const folderPathsToCreate = getPathsToBuild(remoteFolderPaths, localFolderPaths)
    let newFolders: Folder[] = [] // New folders created on the pFDA database
    for (const path of folderPathsToCreate) {
      const folderNames = splitFolderPath(path)
      const res = createFoldersTraverse(
        localFolders.concat(newFolders),
        folderNames,
        user,
        undefined,
        0,
        [],
      )

      // add more metadata - same for each new folder
      res.forEach(newFolder =>
        Object.assign(newFolder, {
          parentType: input.parentType,
          parentId: input.parentId,
          scope: input.scope,
          project: input.projectDxid,
          entityType: FILE_ORIGIN_TYPE.HTTPS,
        }))
      newFolders = newFolders.concat(res)
      // has to be done like this, otherwise child folders
      // do not have how to detect which one is their parent
      // (using just a reference without identifier)
      // eslint-disable-next-line no-await-in-loop
      await em.persist(res)
      await em.flush()
      const createdFolder = res[0]
      const parentFolders = await getParentFolders(createdFolder)
      const folderPath = getFolderPath(parentFolders, createdFolder)
      const folderEvent = await createFolderEvent(EVENT_TYPES.FOLDER_CREATED, createdFolder, folderPath, user)
      await em.persist(folderEvent)
      await em.flush()

      this.ctx.log.info({ folderNames: res.map(f => f.name) }, 'SyncFoldersOperation: Created new folders with names')
    }

    const newAndExistingLocalFolders = localFolders.concat(newFolders)
    // Determine folder paths to keep by finding the set of paths that exists on both dx platform and pFDA db
    const newAndExistingLocalFolderPaths = folderPathsFromFolders(newAndExistingLocalFolders)

    //
    // Determine folders on local database to delete
    //
    const folderPathsToKeep = getPathsToKeep(remoteFolderPaths, newAndExistingLocalFolderPaths)

    // Convert the set of folder paths to the Folder objects that represent that path
    let foldersToKeep: Folder[] = []
    folderPathsToKeep.forEach(path => {
      // Splitting folder path into components to get a list of parent folders, as each of these have unique IDs on
      const folderNames = splitFolderPath(path)

      // This recursively look at the list of names at folderNames
      const res = detectIntersectedTraverse(newAndExistingLocalFolders, folderNames, undefined, 0, [])
      foldersToKeep = foldersToKeep.concat(res)
    })
    // this.ctx.log.info({ foldersToKeep: foldersToKeep.map((f: Folder) => f.name) }, 'Total foldersToKeep')
    this.ctx.log.info({ foldersToKeep: foldersToKeep.length }, 'Total foldersToKeep')

    // we can use this -> kept folders are already persisted and have ids
    foldersToKeep = filterDuplicities(foldersToKeep) // Filter duplicate Folders based on their id

    // Delete folders in pfda db that are not in foldersToKeep
    const foldersToDelete = differenceWith(
      (f1: Folder, f2: Folder) => f1.id === f2.id,
      newAndExistingLocalFolders,
      foldersToKeep,
    )

    // The following two calls was intended to replace the algorithm above but there are subtleties
    // not handled. When dealing with PFDA-2856 this condition occurred where localCount > remoteCount
    // yet foldersToDelete was empty:
    //
    //    "localFolderPathsCount": 15980,
    //    "remoteFolderPathsCount": 10101,
    //    "foldersToDelete": [],
    //    "msg": "SyncFoldersOperation: Folders to delete"
    //
    // Likely the findFolderForPath() function is missing something
    //
    // const folderPathsToDelete = differenceWith((path1: string, path2: string) => path1 === path2,
    //   newAndExistingLocalFolderPaths, remoteFolderPaths)
    // const foldersToDelete = folderPathsToDelete.map(
    //   (folderPath: string) => findFolderForPath(newAndExistingLocalFolders, splitFolderPath(folderPath), undefined))

    this.ctx.log.info({
      localFolderPathsCount: newAndExistingLocalFolderPaths.length,
      remoteFolderPathsCount: remoteFolderPaths.length,
      foldersToDelete: foldersToDelete.map(folder => folder?.name),
    }, 'SyncFoldersOperation: Folders to delete')

    // First delete the files records contained within the folders
    // Avoid doing any database queries inside the Promise.all
    // call as this can lead to a DriverException when there are too many Promises
    let filesToDelete: UserFile[] = []
    for (const folder of foldersToDelete) {
      // Find files to delete in each folder
      const files = await em.find(
        UserFile,
        { parentFolder: folder.id },
        { populate: ['taggings.tag'] },
      )
      filesToDelete = filesToDelete.concat(files)
    }
    this.ctx.log.info({
      filesToDelete,
    }, 'SyncFoldersOperation: Files to delete')
    em.getRepository(UserFile).removeFilesWithTags(filesToDelete)

    // Then delete the folders themselves
    for (const folderToDelete of foldersToDelete) {
      repo.removeWithTags(folderToDelete)
      const parentFolders = await getParentFolders(folderToDelete)
      const folderPath = getFolderPath(parentFolders, folderToDelete)
      const folderEvent = await createFolderEvent(EVENT_TYPES.FOLDER_DELETED, folderToDelete, folderPath, user)
      await em.persist(folderEvent)
    }
    await em.flush()

    return await repo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: input.projectDxid,
    })
  }
}
