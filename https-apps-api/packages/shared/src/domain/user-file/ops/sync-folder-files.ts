import { wrap } from '@mikro-orm/core'
import { difference, map, prop } from 'ramda'
import { Folder, User, UserFile } from '../..'
import { BaseOperation } from '../../../utils'
import { SyncFilesInFolderInput } from '../user-file.input'
import { getFolderPath } from '../user-file.helper'
import { errors, client } from '../../..'
import { FILE_STATE, FILE_STI_TYPE, FILE_ORIGIN_TYPE, PARENT_TYPE } from '../user-file.enum'

export type SyncFolderFilesOutput = {
  folderPath: string
  folder: Folder | null
  files: UserFile[]
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
    let current: Folder | null | undefined
    if (input.folderId) {
      current = foldersInProject.find(f => f.id === input.folderId)
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
    // todo: handle possible pagination here

    // find remote file ids in a given subfolder
    const remoteFiles = await client.filesListPaginated({
      accessToken: this.ctx.user.accessToken,
      folder: folderPath,
      project: input.projectDxid,
      includeDescProps: true,
    })
    const remoteFileDxids = map(prop('id'))(remoteFiles.results)
    const localFileDxids = map(prop('dxid'))(localFiles)
    const toAdd = difference(remoteFileDxids, localFileDxids)
    const toRemove = difference(localFileDxids, remoteFileDxids)

    // update existing files
    localFiles.forEach(userfile => {
      if (toRemove.includes(userfile.dxid)) {
        return
      }
      const remoteState = remoteFiles.results.find(r => r.id === userfile.dxid)
      if (!remoteState) {
        throw new errors.NotFoundError('Remote state for local file was not found', {
          details: { fileId: userfile.id },
        })
      }
      // we test name and size fields
      if (userfile.name !== remoteState.describe!.name) {
        // console.log('updating file name')
        userfile.name = remoteState.describe!.name
      }
      if (userfile.fileSize !== remoteState.describe!.size) {
        userfile.fileSize = remoteState.describe!.size
      }
    })

    // remove
    if (input.runRemove) {
      const filesToRemove = localFiles.filter(file => toRemove.includes(file.dxid))
      fileRepo.removeFilesWithTags(filesToRemove)
      await em.flush()
    }

    // add new files
    if (input.runAdd) {
      toAdd.forEach(dxid => {
        const remoteDetails = remoteFiles.results.find(remoteFile => remoteFile.id === dxid)
        if (!remoteDetails) {
          throw new Error('remote details not found for file dxid')
        }
        const newFile = wrap(new UserFile(em.getReference(User, this.ctx.user.id))).assign(
          {
            dxid: remoteDetails?.id,
            uid: `${remoteDetails.id}-1`,
            name: remoteDetails?.describe?.name,
            fileSize: remoteDetails?.describe?.size,
            project: input.projectDxid,
            scope: input.scope,
            // userId: user?.id,
            parentType: PARENT_TYPE.JOB,
            parentId: input.parentId,
            parentFolderId: current?.id,
            state: FILE_STATE.CLOSED,
            stiType: FILE_STI_TYPE.USERFILE,
            entityType: FILE_ORIGIN_TYPE.HTTPS,
          },
          { em },
        )
        em.persist(newFile)
        return newFile
      })
      await em.flush()
    }

    this.ctx.log.info(
      { folderPath, toAdd, toRemove },
      'files detected to add/remove under given subfolder path',
    )
    // final result
    const files = await fileRepo.findProjectFilesInSubfolder({
      project: input.projectDxid,
      folderId: input.folderId,
    })

    return {
      folderPath,
      files,
      folder: current,
    }
  }
}
