import { wrap } from '@mikro-orm/core'
import { difference, map, prop } from 'ramda'
import { Folder, User, UserFile } from '../..'
import { BaseOperation } from '../../../utils'
import { SyncFilesInFolderInput } from '../user-file.input'
import { getFolderPath } from '../user-file.helper'
import { errors, client } from '../../..'
import { FILE_STATE_DX, FILE_STI_TYPE, FILE_ORIGIN_TYPE, PARENT_TYPE } from '../user-file.types'
import { UserOpsCtx } from '../../../types'

export type SyncFolderFilesOutput = {
  folderPath: string
  folder: Folder | null
  files: UserFile[]
}

export class SyncFilesInFolderOperation extends BaseOperation<
UserOpsCtx,
SyncFilesInFolderInput,
SyncFolderFilesOutput
> {
  async run(input: SyncFilesInFolderInput): Promise<SyncFolderFilesOutput> {
    this.ctx.log.debug({ input }, 'SyncFilesInFolderOperation input params')
    const em = this.ctx.em
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, this.ctx.log)

    const folderRepo = em.getRepository(Folder)
    const fileRepo = em.getRepository(UserFile)
    const foldersInProject = await folderRepo.findForSynchronization({
      userId: this.ctx.user.id,
      projectDxid: input.projectDxid,
    })
    let folderPath: string
    let current: Folder | null | undefined
    // sanitize operation inputs
    if (input.folderId) {
      current = foldersInProject.find(f => f.id === input.folderId)
      if (!current) {
        throw new errors.NotFoundError(`Folder id ${input.folderId.toString()} `
          + 'does not exist under given project')
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
    // just all REGULAR files in the project
    // there will be conflicts with synced status and locallyCreatedFiles
    // point is not to try to recreate them
    const locallyCreatedFiles = await fileRepo.findLocalFilesInProject({
      project: input.projectDxid,
    })
    // todo: handle possible pagination here

    // find remote file ids in a given subfolder
    const remoteFiles = await platformClient.filesList({
      folder: folderPath,
      project: input.projectDxid,
      includeDescProps: true,
    })
    const remoteFileDxids = map(prop('id'))(remoteFiles)
    const localFileDxids: string[] = map(prop('dxid'))(localFiles)
    const locallyCreatedFileDxids = map(prop('dxid'))(locallyCreatedFiles)
    const toAddDifference = difference(remoteFileDxids, localFileDxids)
    const toRemove = difference(localFileDxids, remoteFileDxids)

    // when dxid is found in db it is a copy of the original that has been deleted
    // we don't want to recreate deleted file
    const toAdd: string[] = []
    for (const dxid of toAddDifference) {
      const result = await fileRepo.find({ dxid })
      if (result.length === 0) {
        toAdd.push(dxid)
      }
    }

    if (localFileDxids.length > 0) {
      this.ctx.log.debug(
        { localFileDxids, folderPath },
        'SyncFilesInFolderOperation: Local files detected in given subfolder',
      )
    }
    if (remoteFileDxids.length > 0) {
      this.ctx.log.debug(
        { remoteFileDxids, folderPath },
        'SyncFilesInFolderOperation: Remote files detected in given subfolder',
      )
    }
    this.ctx.log.info(
      { folderPath, toAdd, toRemove },
      'SyncFilesInFolderOperation: Files detected to add/remove under given subfolder path',
    )
    this.ctx.log.info(
      { locallyCreatedFileDxids, folderPath },
      'SyncFilesInFolderOperation: Local NORMAL type files to consider',
    )

    // update existing files
    localFiles.forEach(userfile => {
      if (toRemove.includes(userfile.dxid)) {
        return
      }
      const remoteState = remoteFiles.find(r => r.id === userfile.dxid)
      if (!remoteState) {
        throw new errors.NotFoundError('Remote state for local file was not found', {
          details: { fileId: userfile.id },
        })
      }
      this.ctx.log.info(
        { localFile: userfile, remoteFile: remoteState.describe },
        'SyncFilesInFolderOperation: Updating file metadata',
      )


        // we test name and size fields
        if (userfile.name !== remoteState?.describe?.name) {
          // console.log('updating file name')
          userfile.name = remoteState.describe?.name || ''
        }
        if (userfile.fileSize !== remoteState?.describe?.size) {
          userfile.fileSize = remoteState.describe?.size
        }
        if (userfile.state !== remoteState?.describe?.state) {
          // @ts-ignore
          userfile.state = remoteState.describe?.state
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
        if (locallyCreatedFileDxids.includes(dxid)) {
          this.ctx.log.warn(
            { dxid },
            'SyncFilesInFolderOperation: File already exists in local database, '
            + 'but it is not HTTPS file. Recreating would crash the op.',
          )
          return
        }
        const remoteDetails = remoteFiles.find(remoteFile => remoteFile.id === dxid)
        if (!remoteDetails) {
          throw new Error('remote details not found for file dxid')
        }
        if (remoteDetails.describe && !remoteDetails.describe.size) {
          this.ctx.log.warn(
            { file: remoteDetails },
            'SyncFilesInFolderOperation: File may be in a wrong state, size property is missing',
          )
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
            ...current && { parentFolder: current },
            state: remoteDetails?.describe?.state ?? FILE_STATE_DX.CLOSED,
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
    em.clear()
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
