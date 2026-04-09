import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserFileBulkDownloadFacade } from 'apps/api/src/facade/user-file/user-file-bulk-download.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
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
    return await callback(em)
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

    // it('fail - files not accessible', async () => {})
    //
    // it('basic', async () => {})
    //
    // it('basic', async () => {})
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
