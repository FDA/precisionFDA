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
import { User } from '../..'
import { errors } from '../../..'

// todo: maybe another operation type for "can be called from another operation"
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
    // console.log(localFolders, localFolderPaths, 'locall')
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
        }),
      )
      newFolders = newFolders.concat(res)
      // has to be done like this, otherwise child folders
      // do not have how to detect which one is their parent
      // (using just a reference without identifier)
      // eslint-disable-next-line no-await-in-loop
      await em.persistAndFlush(res)
    }
    // console.log(pathsToBuild, newFolders, 'to create?')

    // paths to keep and then to remove
    // todo: refresh everything!
    localFolderPaths = parseFoldersFromDatabase(localFolders.concat(newFolders))
    const pathsToKeep = getPathsToKeep(remotePaths, localFolderPaths)
    // console.log(pathsToKeep, 'keep')
    let foldersToKeep: Folder[] = []
    pathsToKeep.forEach(path => {
      const names = getFolders(path)
      const res = foldersToKeep.concat(
        detectIntersectedTraverse(localFolders.concat(newFolders), names, undefined, 0, []),
      )
      foldersToKeep = foldersToKeep.concat(res)
    })
    // we can use this -> kept folders are already persisted and have ids
    foldersToKeep = filterDuplicities(foldersToKeep)
    const foldersToDelete = differenceWith(
      (f1: Folder, f2: Folder) => f1.id === f2.id,
      localFolders.concat(newFolders),
      foldersToKeep,
    )
    // console.log(foldersToKeep, 'keep this')
    await em.removeAndFlush(foldersToDelete)
    // console.log(localFolders, 'delete this')

    // and plug in to the worker
    // prepare whatever is needed for staging setup but only non-breaking changes
    // then files sync
    // console.log(localFolders.concat(newFolders).length, 'len test')
    return await repo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: input.projectDxid,
    })
  }
}
