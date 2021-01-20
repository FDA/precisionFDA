import { difference, isNil, map, prop } from 'ramda'
import { wrap } from '@mikro-orm/core'
import { Folder, User, UserFile } from '../..'
import { BaseOperation } from '../../../utils'
import { SyncFilesInFolderInput } from '../user-file.input'
import { getFolderPath } from '../user-file.helper'
import { errors, client } from '../../..'
import type { Maybe } from '../../../types'
import { FILE_STATE, FILE_STI_TYPE } from '../user-file.enum'

export class SyncFilesInFolderOperation extends BaseOperation<SyncFilesInFolderInput, UserFile[]> {
  async run(input: SyncFilesInFolderInput): Promise<UserFile[]> {
    const em = this.ctx.em.fork(false)
    const folderRepo = em.getRepository(Folder)
    const fileRepo = em.getRepository(UserFile)

    // BEGIN TRANSACTION
    await em.begin()
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const user = (await em.findOne(User, { id: this.ctx.user.id }))!
      const foldersInProject = await folderRepo.findForSynchronization({
        userId: this.ctx.user.id,
        projectDxid: input.projectDxid,
      })
      let folderPath: string
      let current: Maybe<Folder>
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
        folderPath = '/'
      }
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

      // build toAdd
      if (toAdd.length > 0) {
        // get more details about toAdd
        const newFileDetails = await client.filesDescribe({
          accessToken: this.ctx.user.accessToken,
          fileIds: toAdd,
        })
        const newFiles = toAdd.map(dxid => {
          const details = newFileDetails.results.find(f => f.describe.id === dxid)
          if (!details) {
            throw new errors.NotFoundError('File not found in the filesDescribe response', {
              details: { dxid },
            })
          }
          const folderOrUndef = !isNil(current) ? current : undefined
          return wrap(new UserFile(user, folderOrUndef)).assign(
            {
              dxid: details.describe.id,
              project: input.projectDxid,
              parentFolder: !isNil(current) ? wrap(current).toReference() : undefined,
              state: FILE_STATE.CLOSED,
              name: details.describe.name,
              userId: user.id,
              scope: input.scope,
              fileSize: details.describe.size,
              parentId: input.parentId,
              parentType: input.parentType,
              uid: `${details.describe.id}-1`,
              stiType: FILE_STI_TYPE.USERFILE,
              entityType: input.entityType,
            },
            { em },
          )
        })
        em.persist(newFiles)
      }

      // build toRemove
      if (toRemove.length > 0) {
        const localFiltered = localFiles.filter(fileEntity => toRemove.includes(fileEntity.dxid))
        if (localFiltered.length !== toRemove.length) {
          throw new errors.NotFoundError('Some Local user files to delete were not found', {
            details: { missingDxids: difference(toRemove, localFileDxids) },
          })
        }
        localFiltered.forEach(f => {
          fileRepo.remove(f)
          f.taggings.getItems().forEach(tagging => tagging.tag.taggingCount--)
          f.taggings.removeAll()
        })
      }
      // TRANSACTION CLOSE
      await em.commit()
      return await fileRepo.findProjectFilesInSubfolder({
        project: input.projectDxid,
        folderId: input.folderId,
      })
    } catch (err) {
      this.ctx.log.error({ err }, 'Transaction failed to commit')
      await em.rollback()
      return []
    }
  }
}
