import { difference, map, prop } from 'ramda'
import { Folder, UserFile } from '../..'
import { BaseOperation } from '../../../utils'
import { SyncFilesInFolderInput } from '../user-file.input'
import { getFolderPath } from '../user-file.helper'
import { errors, client } from '../../..'

export type SyncFolderFilesOutput = {
  folderPath: string
  folder: Folder | null
  toAdd: string[]
  toRemove: string[]
}

export class SyncFilesInFolderOperation extends BaseOperation<
  SyncFilesInFolderInput,
  SyncFolderFilesOutput
> {
  async run(input: SyncFilesInFolderInput): Promise<SyncFolderFilesOutput> {
    const em = this.ctx.em

    const folderRepo = em.getRepository(Folder)
    const fileRepo = em.getRepository(UserFile)
    const foldersInProject = await folderRepo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: input.projectDxid,
    })
    let folderPath: string
    let current: Folder | null
    if (input.folderId) {
      current = await folderRepo.findOne({ id: input.folderId, project: input.projectDxid })
      if (!current) {
        throw new errors.NotFoundError(
          `Folder id ${input.folderId.toString()} does not exist under given project`,
        )
      }
      // transfer folderId into API path string
      folderPath = getFolderPath(foldersInProject, current)
    } else {
      // root folder
      current = null
      folderPath = '/'
    }
    // also should not be touched by other transactions
    // get local files in a given (sub)folder
    const localFiles = await fileRepo.findProjectFilesInSubfolder({
      project: input.projectDxid,
      folderId: input.folderId,
    })
    // todo: assign tags to the logs in client otherwise it could get so messy
    // todo: handle possible pagination here

    // find remote file ids in a given subfolder
    const remoteFiles = await client.filesList({
      accessToken: this.ctx.user.accessToken,
      folder: folderPath,
      project: input.projectDxid,
    })
    const remoteFileDxids = map(prop('id'))(remoteFiles.results)
    const localFileDxids = map(prop('dxid'))(localFiles)
    const toAdd = difference(remoteFileDxids, localFileDxids)
    const toRemove = difference(localFileDxids, remoteFileDxids)
    this.ctx.log.info(
      { folderPath, toAdd, toRemove },
      'files added/removed under given subfolder path',
    )

    return {
      folderPath,
      toAdd,
      toRemove,
      folder: current,
    }
  }
}
