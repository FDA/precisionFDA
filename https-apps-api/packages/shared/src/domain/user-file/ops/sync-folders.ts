import { differenceWith } from 'ramda'
import { BaseOperation } from '../../../utils'
import { Folder } from '../folder.entity'
import { SyncFoldersInput } from '../user-file.input'
import {
  getPathsToBuild,
  parseFoldersFromDatabase,
  parseFoldersFromClient,
  getFolders,
  createFoldersTraverse,
  detectIntersectedTraverse,
  getPathsToKeep,
  filterDuplicities,
} from '../user-file.helper'
import { User, UserFile } from '../..'
import { errors } from '../../..'
import { FILE_ORIGIN_TYPE } from '../user-file.enum'

// todo: maybe another operation type for "can be called from another operation"

// Operation sychronizing the folder structure of a dx project to the pfda database
// Comparison of equivalent folders is done by comparing their full paths
// Contents of newly created folders (those that exist on dx platform but not pfda) are not synchronized
// by this operation, but it would remove files contained within deleted folders on the pfda side
export class SyncFoldersOperation extends BaseOperation<SyncFoldersInput, Folder[]> {
  async run(input: SyncFoldersInput): Promise<Folder[]> {
    const em = this.ctx.em
    const user = await em.findOne(User, { id: this.ctx.user.id })
    if (!user) {
      throw new errors.UserNotFoundError()
    }
    const repo = em.getRepository(Folder)
    // cleanup the input
    const remotePaths = parseFoldersFromClient(input.remoteFolderPaths)
    const localFolders = await repo.findForSynchronization({
      userId: user.id,
      projectDxid: input.projectDxid,
    })
    let localFolderPaths = parseFoldersFromDatabase(localFolders)
    // newly discovered paths
    const pathsToBuild = getPathsToBuild(remotePaths, localFolderPaths)
    let newFolders: Folder[] = []
    for (const path of pathsToBuild) {
      const names = getFolders(path)
      const res = createFoldersTraverse(
        localFolders.concat(newFolders),
        names,
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
        }),
      )
      newFolders = newFolders.concat(res)
      // has to be done like this, otherwise child folders
      // do not have how to detect which one is their parent
      // (using just a reference without identifier)
      // eslint-disable-next-line no-await-in-loop
      await em.persistAndFlush(res)
      this.ctx.log.info({ folderNames: res.map(f => f.name) }, 'created new folders with names')
    }

    // paths to keep and then to remove
    localFolderPaths = parseFoldersFromDatabase(localFolders.concat(newFolders))
    const pathsToKeep = getPathsToKeep(remotePaths, localFolderPaths)
    // This log item should be removed once PFDA-2715 is resolved
    this.ctx.log.info({
        localFolderPaths: localFolderPaths,
        pathsToKeep: pathsToKeep,
      },
      'About to call pathsToKeep.forEach')
    // TODO: refactor the following block that leads to the creation of foldersToDelete into
    //       a helper function, so that we can unit test it
    let foldersToKeep: Folder[] = []
    pathsToKeep.forEach(path => {
      const names = getFolders(path)
      const res = foldersToKeep.concat(
        detectIntersectedTraverse(localFolders.concat(newFolders), names, undefined, 0, []),
      )
      // This log item should be removed once PFDA-2715 is resolved
      this.ctx.log.info({
          "res.length": res.length,
          "foldersToKeep.length": foldersToKeep.length,
        },
        'Inside pathsToKeep.forEach')
      foldersToKeep = foldersToKeep.concat(res)
    })
    this.ctx.log.info({ foldersToKeep: foldersToKeep }, 'Total foldersToKeep')

    // we can use this -> kept folders are already persisted and have ids
    foldersToKeep = filterDuplicities(foldersToKeep)
    const foldersToDelete = differenceWith(
      (f1: Folder, f2: Folder) => f1.id === f2.id,
      localFolders.concat(newFolders),
      foldersToKeep,
    )

    this.ctx.log.info({ names: foldersToDelete.map(f => f.name) }, 'folders to delete')
    await Promise.all(
      foldersToDelete.map(async folder => {
        // delete files of given folder
        const files = await em.find(
          UserFile,
          { parentFolderId: folder.id },
          { populate: ['taggings.tag'] },
        )
        em.getRepository(UserFile).removeFilesWithTags(files)
        repo.removeWithTags(folder)
      }),
    )
    await em.flush()

    return await repo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: input.projectDxid,
    })
  }
}
