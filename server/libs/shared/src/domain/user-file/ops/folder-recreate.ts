import { PlatformClient } from '../../../platform-client'
import { Folder, User, UserFile } from '../..'
import { BaseOperation } from '../../../utils'
import { filterLeafPaths, getFolderPath, getPathsToBuild } from '../user-file.helper'
import { FILE_STI_TYPE } from '../user-file.types'
import { errors } from '../../..'
import { UserOpsCtx } from '../../../types'

type RecreateFolderInput = {}

export class FolderRecreateOperation extends BaseOperation<
UserOpsCtx,
RecreateFolderInput,
void
> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(input: RecreateFolderInput): Promise<void> {
    const em = this.ctx.em
    const client = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    const userId = this.ctx.user.id
    const user = await em.findOne(User, { id: userId })
    if (!user) {
      throw new errors.UserNotFoundError()
    }
    const projectId = user.privateFilesProject || ''
    // todo: run for more than this project?
    // todo: this will still not work properly for scopes -> make sure we know about that

    const folderRepo = em.getRepository(Folder)
    const localFolders = await em.find(Folder, {
      user: folderRepo.getReference(userId),
      // (not synced) folders have project=null
      // project: null,
      $or: [{ project: null }, { project: projectId }],
    })
    const projectDesc = await client.foldersList({
      projectId,
    })
    this.ctx.log.debug({ folders: projectDesc.folders, projectId }, 'folders list in the platform')
    const remoteFolderPaths = projectDesc.folders
    const localFoldersWithPath: Array<Folder & { folderPath: string }> = localFolders.map(folder => Object.assign(folder, { folderPath: getFolderPath(localFolders, folder) }))
    // all folder paths to move files into etc
    const pathsToHandleRemotely = getPathsToBuild(
      localFoldersWithPath.map(lf => lf.folderPath),
      remoteFolderPaths,
    )
    this.ctx.log.debug(
      { pathsToHandleRemotely, projectId },
      'all paths detected that exist in pfda but not in the project',
    )
    // folder paths that need to be built remotely in order to have them all
    const pathsToBuildRemotely = filterLeafPaths(pathsToHandleRemotely)
    this.ctx.log.debug({ pathsToBuildRemotely, projectId }, 'leaf paths to build in the platform')

    // todo: use p-limit
    await Promise.all(pathsToBuildRemotely.map(async folderPath =>
      await client.folderCreate({
        folderPath,
        projectId,
      })))
    // fixme: refactor this back-and-forth, filter using getPathsToBuild
    const localFoldersToMigrate = localFoldersWithPath.filter(lf =>
      pathsToHandleRemotely.includes(lf.folderPath))
    await Promise.all(localFoldersToMigrate.map(async lf => {
      // find its files
      const filesInFolder = await em.find(UserFile, {
        project: projectId,
        parentFolder: lf.id,
        stiType: { $ne: FILE_STI_TYPE.FOLDER },
      })
      this.ctx.log.debug(
        { fileIds: filesInFolder.map(f => f.id), folderId: lf.id },
        'will move files in the platform',
      )
      if (filesInFolder.length > 0) {
        // run the api call
        await client.filesMoveToFolder({
          destinationFolderPath: lf.folderPath,
          projectId,
          fileIds: filesInFolder.map(f => f.dxid),
        })
      }
      // should also change folder entity -> add project, maybe remove the entity_type -> ENTIRELY?
      lf.project = projectId
    }))
    await em.flush()
  }
}
