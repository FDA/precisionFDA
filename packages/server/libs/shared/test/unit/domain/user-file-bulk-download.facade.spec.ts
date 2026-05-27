import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserFileBulkDownloadFacade } from 'apps/api/src/facade/user-file/user-file-bulk-download.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { InvalidRequestError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { TimeUtils } from '@shared/utils/time.utils'

describe('UserFileBulkDownloadFacade', () => {
  const USER_ID = 4

  const emPopulateStub = stub()
  const emPersistStub = stub()
  const em = {
    persist: emPersistStub,
    populate: emPopulateStub,
    transactional: async <T>(callback: (em: SqlEntityManager) => Promise<T>): Promise<T> => {
      return callback(em as SqlEntityManager)
    },
  } as unknown as SqlEntityManager
  em.transactional = stub(em, 'transactional').callsFake(async callback => {
    return callback(em)
  }) as SqlEntityManager['transactional']

  const nodeServiceLoadNodesStub = stub()
  const nodeRepoFindAccessibleStub = stub()
  const nodeHelperGetWarningsForUnclosedFilesStub = stub()
  const nodeHelperSanitizeNodeNamesStub = stub()
  const nodeHelperRenameDuplicateFilesStub = stub()
  const nodeHelperGetFolderPathStub = stub()
  const nodeHelperGetNodePathStub = stub()
  const eventHelperCreateFileEvent = stub()
  const userClientFileDownloadLinkStub = stub()
  const notificationServiceCreateNotificationStub = stub()

  const user = {} as unknown as User
  const userCtx = {
    id: USER_ID,
    loadEntity: async () => user,
  } as unknown as UserContext
  const userClient = {
    fileDownloadLink: userClientFileDownloadLinkStub,
  } as unknown as PlatformClient
  const nodeHelper = {
    getWarningsForUnclosedFiles: nodeHelperGetWarningsForUnclosedFilesStub,
    sanitizeNodeNames: nodeHelperSanitizeNodeNamesStub,
    renameDuplicateFiles: nodeHelperRenameDuplicateFilesStub,
    getFolderPath: nodeHelperGetFolderPathStub,
    getNodePath: nodeHelperGetNodePathStub,
  } as unknown as NodeHelper
  const eventHelper = {
    createFileEvent: eventHelperCreateFileEvent,
  } as unknown as EventHelper
  const nodeRepo = {
    findAccessible: nodeRepoFindAccessibleStub,
  } as unknown as NodeRepository
  const nodeService = {
    loadNodes: nodeServiceLoadNodesStub,
  } as unknown as NodeService
  const notificationService = {
    createNotification: notificationServiceCreateNotificationStub,
  } as unknown as NotificationService

  beforeEach(async () => {
    emPersistStub.reset()
    emPersistStub.throws()

    emPopulateStub.reset()
    emPopulateStub.throws()

    nodeServiceLoadNodesStub.reset()
    nodeServiceLoadNodesStub.throws()

    nodeRepoFindAccessibleStub.reset()
    nodeRepoFindAccessibleStub.throws()

    nodeHelperGetWarningsForUnclosedFilesStub.reset()
    nodeHelperGetWarningsForUnclosedFilesStub.throws()

    nodeHelperSanitizeNodeNamesStub.reset()
    nodeHelperSanitizeNodeNamesStub.throws()

    nodeHelperRenameDuplicateFilesStub.reset()
    nodeHelperRenameDuplicateFilesStub.throws()

    nodeHelperGetFolderPathStub.reset()
    nodeHelperGetFolderPathStub.throws()

    nodeHelperGetNodePathStub.reset()
    nodeHelperGetNodePathStub.throws()

    eventHelperCreateFileEvent.reset()
    eventHelperCreateFileEvent.throws()

    userClientFileDownloadLinkStub.reset()
    userClientFileDownloadLinkStub.throws()

    notificationServiceCreateNotificationStub.reset()
    notificationServiceCreateNotificationStub.throws()
  })

  describe('#composeFilesForBulkDownload', async () => {
    it('basic', async () => {
      const folderPath = '/path/to/folder'
      const urlPrefix = 'url-to/'
      const files = [
        {
          id: 45,
          name: 'file_45',
          dxid: 'file-45',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          project: 'project-1',
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
        {
          id: 67,
          name: 'file_67',
          dxid: 'file-67',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
      ]
      const fileIds = [files[0].id, files[1].id]
      const folderId = 10

      emPersistStub.reset()
      emPopulateStub.reset()
      nodeServiceLoadNodesStub.withArgs(fileIds, {}).resolves(files)
      nodeRepoFindAccessibleStub.withArgs({ id: fileIds }).resolves(files)
      nodeHelperGetWarningsForUnclosedFilesStub.returns(null) // we don't care about params here
      nodeHelperSanitizeNodeNamesStub.withArgs(files).returns(files)
      nodeHelperRenameDuplicateFilesStub.withArgs(files).returns(files)
      nodeHelperGetFolderPathStub.withArgs(folderId).resolves(folderPath)
      files.forEach(file => {
        nodeHelperGetNodePathStub.withArgs(file).resolves(`${folderPath}/${file.name}`)
        userClientFileDownloadLinkStub
          .withArgs({
            fileDxid: file.dxid,
            filename: file.name,
            project: file.project,
            duration: TimeUtils.daysToSeconds(1),
          })
          .resolves({ url: `${urlPrefix}${file.name}` })
        eventHelperCreateFileEvent
          .withArgs(EVENT_TYPES.FILE_BULK_DOWNLOAD, file, `${folderPath}/${file.name}`, user)
          .resolves({ type: EVENT_TYPES.FILE_BULK_DOWNLOAD })
      })

      const facade = getInstance()

      const result = await facade.composeFilesForBulkDownload(fileIds, folderId)

      expect(emPersistStub.calledTwice).to.be.true()
      expect(emPersistStub.firstCall.firstArg.type).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)
      expect(emPersistStub.secondCall.firstArg.type).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)

      expect(result.scope).to.eq(files[0].scope)
      expect(result.files.length).to.eq(2)
      expect(result.files[0].url).to.eq(`${urlPrefix}${files[0].name}`)
      expect(result.files[0].path).to.eq(`/${files[0].name}`)
      expect(result.files[1].url).to.eq(`${urlPrefix}${files[1].name}`)
      expect(result.files[1].path).to.eq(`/${files[1].name}`)

      expect(notificationServiceCreateNotificationStub.notCalled).to.be.true()
    })

    it('with warnings for unclosed files', async () => {
      const folderPath = '/path/to/folder'
      const urlPrefix = 'url-to/'
      const files = [
        {
          id: 45,
          name: 'file_45',
          dxid: 'file-45',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          project: 'project-1',
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
        {
          id: 67,
          name: 'file_67',
          dxid: 'file-67',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          state: FILE_STATE_DX.OPEN,
        } as unknown as UserFile,
      ]
      const closedFiles = [files[0]]
      const fileIds = [files[0].id, files[1].id]
      const folderId = 10

      emPersistStub.reset()
      emPopulateStub.reset()
      notificationServiceCreateNotificationStub.reset()
      nodeServiceLoadNodesStub.withArgs(fileIds, {}).resolves(files)
      nodeRepoFindAccessibleStub.withArgs({ id: fileIds }).resolves(files)
      nodeHelperGetWarningsForUnclosedFilesStub.returns(files[1].name) // we don't care about params here
      nodeHelperSanitizeNodeNamesStub.withArgs(closedFiles).returns(closedFiles)
      nodeHelperRenameDuplicateFilesStub.withArgs(closedFiles).returns(closedFiles)
      nodeHelperGetFolderPathStub.withArgs(folderId).resolves(folderPath)
      closedFiles.forEach(file => {
        nodeHelperGetNodePathStub.withArgs(file).resolves(`${folderPath}/${file.name}`)
        userClientFileDownloadLinkStub
          .withArgs({
            fileDxid: file.dxid,
            filename: file.name,
            project: file.project,
            duration: TimeUtils.daysToSeconds(1),
          })
          .resolves({ url: `${urlPrefix}${file.name}` })
        eventHelperCreateFileEvent
          .withArgs(EVENT_TYPES.FILE_BULK_DOWNLOAD, file, `${folderPath}/${file.name}`, user)
          .resolves({ type: EVENT_TYPES.FILE_BULK_DOWNLOAD })
      })

      const facade = getInstance()

      const result = await facade.composeFilesForBulkDownload(fileIds, folderId)

      expect(emPersistStub.calledOnce).to.be.true()
      expect(emPersistStub.firstCall.firstArg.type).to.eq(EVENT_TYPES.FILE_BULK_DOWNLOAD)

      expect(result.scope).to.eq(files[0].scope)
      expect(result.files.length).to.eq(1)
      expect(result.files[0].url).to.eq(`${urlPrefix}${files[0].name}`)
      expect(result.files[0].path).to.eq(`/${files[0].name}`)

      expect(notificationServiceCreateNotificationStub.calledOnce).to.be.true()
    })

    it('includes files from selected folders', async () => {
      const folderPath = '/path/to/folder'
      const urlPrefix = 'url-to/'
      const folder = {
        id: 10,
        name: 'folder_10',
        stiType: FILE_STI_TYPE.FOLDER,
        scope: 'private',
        state: null,
      } as unknown as Folder
      const file = {
        id: 45,
        name: 'file_45',
        dxid: 'file-45',
        stiType: FILE_STI_TYPE.USERFILE,
        scope: 'private',
        project: 'project-1',
        state: FILE_STATE_DX.CLOSED,
      } as unknown as UserFile

      const nodes = [folder, file]
      const closedFiles = [file]
      const fileIds = [folder.id]

      emPersistStub.reset()
      emPopulateStub.reset()
      nodeServiceLoadNodesStub.withArgs(fileIds, {}).resolves(nodes)
      nodeRepoFindAccessibleStub.withArgs({ id: [folder.id, file.id] }).resolves([folder, file])
      nodeHelperGetWarningsForUnclosedFilesStub.returns(null)
      nodeHelperSanitizeNodeNamesStub.withArgs(closedFiles).returns(closedFiles)
      nodeHelperRenameDuplicateFilesStub.withArgs(closedFiles).returns(closedFiles)
      nodeHelperGetFolderPathStub.withArgs(undefined).resolves(folderPath)
      nodeHelperGetNodePathStub.withArgs(file).resolves(`${folderPath}/${file.name}`)
      userClientFileDownloadLinkStub
        .withArgs({
          fileDxid: file.dxid,
          filename: file.name,
          project: file.project,
          duration: TimeUtils.daysToSeconds(1),
        })
        .resolves({ url: `${urlPrefix}${file.name}` })
      eventHelperCreateFileEvent
        .withArgs(EVENT_TYPES.FILE_BULK_DOWNLOAD, file, `${folderPath}/${file.name}`, user)
        .resolves({ type: EVENT_TYPES.FILE_BULK_DOWNLOAD })

      const facade = getInstance()

      const result = await facade.composeFilesForBulkDownload(fileIds)

      expect(result.scope).to.eq('private')
      expect(result.files.length).to.eq(1)
      expect(result.files[0].url).to.eq(`${urlPrefix}${file.name}`)
      expect(result.files[0].path).to.eq(`/${file.name}`)
    })

    it('rejects mixed-scope selections', async () => {
      const nodes = [
        {
          id: 45,
          name: 'private_file',
          dxid: 'file-45',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          project: 'project-1',
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
        {
          id: 67,
          name: 'public_file',
          dxid: 'file-67',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'public',
          project: 'project-1',
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
      ]
      const fileIds = [45, 67]

      nodeServiceLoadNodesStub.withArgs(fileIds, {}).resolves(nodes)
      nodeRepoFindAccessibleStub.withArgs({ id: fileIds }).resolves(nodes)

      const facade = getInstance()

      await expect(facade.composeFilesForBulkDownload(fileIds)).to.be.rejectedWith(
        InvalidRequestError,
        'Bulk download requires all selected items to be in the same scope',
      )
    })

    it('does not mutate original node names when sanitizing and deduplicating download names', async () => {
      const folderPath = '/path/to/folder'
      const files = [
        {
          id: 45,
          name: 'file/a.txt',
          dxid: 'file-45',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          project: 'project-1',
          parentFolder: null,
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
        {
          id: 67,
          name: 'file/a.txt',
          dxid: 'file-67',
          stiType: FILE_STI_TYPE.USERFILE,
          scope: 'private',
          project: 'project-1',
          parentFolder: null,
          state: FILE_STATE_DX.CLOSED,
        } as unknown as UserFile,
      ]
      const fileIds = [45, 67]

      emPersistStub.reset()
      emPopulateStub.reset()

      const immutableNameHelper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
      )
      const realNameNodeHelper = {
        getWarningsForUnclosedFiles: nodeHelperGetWarningsForUnclosedFilesStub,
        sanitizeNodeNames: immutableNameHelper.sanitizeNodeNames.bind(immutableNameHelper),
        renameDuplicateFiles: immutableNameHelper.renameDuplicateFiles.bind(immutableNameHelper),
        getFolderPath: nodeHelperGetFolderPathStub,
        getNodePath: nodeHelperGetNodePathStub,
      } as unknown as NodeHelper

      nodeServiceLoadNodesStub.withArgs(fileIds, {}).resolves(files)
      nodeRepoFindAccessibleStub.withArgs({ id: fileIds }).resolves(files)
      nodeHelperGetWarningsForUnclosedFilesStub.returns(null)
      nodeHelperGetFolderPathStub.withArgs(undefined).resolves(folderPath)
      nodeHelperGetNodePathStub.callsFake(async node => `${folderPath}/${(node as UserFile).name}`)
      userClientFileDownloadLinkStub.callsFake(async ({ filename }: { filename: string }) => ({ url: `url-to/${filename}` }))
      eventHelperCreateFileEvent.callsFake(async () => ({ type: EVENT_TYPES.FILE_BULK_DOWNLOAD }))

      const facade = new UserFileBulkDownloadFacade(
        em,
        userCtx,
        userClient,
        realNameNodeHelper,
        eventHelper,
        nodeRepo,
        nodeService,
        notificationService,
      )

      const result = await facade.composeFilesForBulkDownload(fileIds)

      expect(files[0].name).to.eq('file/a.txt')
      expect(files[1].name).to.eq('file/a.txt')
      expect(result.files.map(file => file.path)).to.deep.eq(['/filea.txt', '/filea 1.txt'])
    })
  })

  function getInstance(): UserFileBulkDownloadFacade {
    return new UserFileBulkDownloadFacade(
      em,
      userCtx,
      userClient,
      nodeHelper,
      eventHelper,
      nodeRepo,
      nodeService,
      notificationService,
    )
  }
})
