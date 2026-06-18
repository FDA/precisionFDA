import { create } from 'axios'
import { expect } from 'chai'
import { is } from 'ramda'
import { match, stub } from 'sinon'
import { LicenseService } from '@shared/domain/license/license.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { UserFilePaginationDTO } from '@shared/domain/user-file/dto/user-file-pagination.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { FileListRetrieveFacade } from '@shared/facade/file-list-retrieve/file-list-retrieve.facade'

describe('FileListRetrieveFacade', () => {
  const nodePaginateStub = stub()
  const resolveOriginStub = stub()
  const getParentFolderStub = stub()
  const getFolderPathEntriesStub = stub()
  const spaceGetAccessibleByIdStub = stub()
  const findLicensesAndAcceptedLicensesByItemIdsStub = stub()

  const USER = {
    id: 999,
    name: 'Test User',
    dxuser: 'testuser',
  } as unknown as User

  const LICENSE = {
    id: 1,
    title: 'Test License',
    approvalRequired: false,
    acceptedLicenses: {
      getItems: () => [
        {
          user: { getEntity: () => USER },
          state: 'accepted',
        },
      ],
    },
  }

  const APPROVAL_PENDING_LICENSE = {
    id: 2,
    title: 'Approval Pending License',
    approvalRequired: true,
    acceptedLicenses: {
      getItems: () => [
        {
          user: { getEntity: () => USER },
          state: 'pending',
        },
      ],
    },
  }

  const FILE1 = {
    id: 1,
    name: 'file1.txt',
    uid: 'file-uid-1',
    stiType: FILE_STI_TYPE.USERFILE,
    scope: STATIC_SCOPE.PRIVATE,
    createdAt: new Date(),
    user: { getEntity: () => USER },
    taggings: { isInitialized: () => false },
    properties: { isInitialized: () => false },
  } as unknown as UserFile
  Object.setPrototypeOf(FILE1, UserFile.prototype)

  const FOLDER = {
    id: 2,
    name: 'folder1',
    stiType: FILE_STI_TYPE.FOLDER,
    scope: STATIC_SCOPE.PRIVATE,
    createdAt: new Date(),
    user: { getEntity: () => USER },
    isInSpace: () => false,
  } as unknown as Folder

  const FILE_IN_FOLDER = {
    id: 3,
    name: 'file2.txt',
    uid: 'file-uid-2',
    stiType: FILE_STI_TYPE.USERFILE,
    scope: STATIC_SCOPE.PRIVATE,
    parentFolder: FOLDER,
    createdAt: new Date(),
    user: { getEntity: () => USER },
    taggings: { isInitialized: () => false },
    properties: { isInitialized: () => false },
  } as unknown as UserFile
  Object.setPrototypeOf(FILE_IN_FOLDER, UserFile.prototype)

  const SPACE = {
    id: 123,
    name: 'Test Space',
    type: SPACE_TYPE.GROUPS,
    scope: 'space-123',
    isConfidential: () => false,
  } as unknown as Space

  const SPACE_FILE = {
    id: 4,
    name: 'space_file1.txt',
    uid: 'file-uid-4',
    stiType: FILE_STI_TYPE.USERFILE,
    scope: SPACE.scope,
    createdAt: new Date(),
    user: { getEntity: () => USER },
    taggings: { isInitialized: () => false },
    properties: { isInitialized: () => false },
    isInSpace: () => true,
  } as unknown as UserFile
  Object.setPrototypeOf(SPACE_FILE, UserFile.prototype)

  const SPACE_FOLDER = {
    id: 5,
    name: 'space_folder1',
    stiType: FILE_STI_TYPE.FOLDER,
    scope: SPACE.scope,
    createdAt: new Date(),
    user: { getEntity: () => USER },
    isInSpace: () => true,
  } as unknown as Folder

  const USER_UPLOAD_ORIGIN = {
    origin: 'Uploaded',
    parentType: PARENT_TYPE.USER,
    parentUid: null,
  }

  const userContext = {
    id: USER.id,
    accessToken: 'test-token',
    dxuser: USER.dxuser,
    loadEntity: async () => USER,
  } as unknown as UserContext
  const nodeService = {
    paginate: nodePaginateStub,
  } as unknown as NodeService
  const nodeHelper = {
    resolveOrigin: resolveOriginStub,
    getParentFolder: getParentFolderStub,
    getFolderPathEntries: getFolderPathEntriesStub,
  } as unknown as NodeHelper
  const spaceService = {
    getAccessibleById: spaceGetAccessibleByIdStub,
  } as unknown as SpaceService
  const licenseService = {
    findLicensesAndAcceptedLicensesByItemIds: findLicensesAndAcceptedLicensesByItemIdsStub,
  } as unknown as LicenseService

  beforeEach(() => {
    nodePaginateStub.reset()
    nodePaginateStub.resolves({ data: [], total: 0, page: 1, pageSize: 10 })
    nodePaginateStub.withArgs(match.has('scope', STATIC_SCOPE.PRIVATE)).resolves({
      data: [FILE1, FOLDER, FILE_IN_FOLDER],
      total: 3,
      page: 1,
      pageSize: 10,
    })
    nodePaginateStub.withArgs(match.has('scope', STATIC_SCOPE.PRIVATE).and(match.has('folderId', FOLDER.id))).resolves({
      data: [FILE_IN_FOLDER],
      total: 1,
      page: 1,
      pageSize: 10,
    })
    nodePaginateStub.withArgs(match.has('scope', SPACE.scope)).resolves({
      data: [SPACE_FILE, SPACE_FOLDER],
      total: 2,
      page: 1,
      pageSize: 10,
    })

    resolveOriginStub.reset()
    resolveOriginStub
      .withArgs(FILE1)
      .resolves(USER_UPLOAD_ORIGIN)
      .withArgs(FILE_IN_FOLDER)
      .resolves(USER_UPLOAD_ORIGIN)
      .withArgs(SPACE_FILE)
      .resolves(USER_UPLOAD_ORIGIN)
    getParentFolderStub.reset()
    getFolderPathEntriesStub.reset()
    getFolderPathEntriesStub.throws()

    spaceGetAccessibleByIdStub.reset()
    spaceGetAccessibleByIdStub.withArgs(SPACE.id).resolves(SPACE)

    findLicensesAndAcceptedLicensesByItemIdsStub.reset()
    findLicensesAndAcceptedLicensesByItemIdsStub.resolves(new Map())
    findLicensesAndAcceptedLicensesByItemIdsStub
      .withArgs('Node', [FILE1.id, FOLDER.id, FILE_IN_FOLDER.id])
      .resolves(new Map([[FILE1.id, { license: LICENSE, userAcceptedLicensesCount: 1 }]]))
    findLicensesAndAcceptedLicensesByItemIdsStub
      .withArgs('Node', [SPACE_FILE.id, SPACE_FOLDER.id])
      .resolves(new Map([[SPACE_FILE.id, { license: APPROVAL_PENDING_LICENSE, userAcceptedLicensesCount: 0 }]]))
  })

  describe('retrieveAccessibleFiles', () => {
    it('should retrieve and map files and folders in private scope correctly', async () => {
      const query = {
        scope: STATIC_SCOPE.PRIVATE,
        fields: { origin: false, path: false },
      } as UserFilePaginationDTO

      const facade = getInstance()
      const result = await facade.retrieveAccessibleFiles(query)
      expect(result.data.length).to.equal(3)
      expect(nodePaginateStub.calledWith(query)).to.be.true()
      expect(
        findLicensesAndAcceptedLicensesByItemIdsStub.calledWith('Node', [FILE1.id, FOLDER.id, FILE_IN_FOLDER.id]),
      ).to.be.true()
      const file1DTO: FileGetDTO = result.data.find(item => (item as FileGetDTO).uid === FILE1.uid) as FileGetDTO
      expect(file1DTO).to.include({
        name: FILE1.name,
      })
      expect(file1DTO.fileLicense).to.deep.equal({
        id: LICENSE.id,
        uid: `license-${LICENSE.id}`,
        title: LICENSE.title,
        approvalRequired: LICENSE.approvalRequired,
        acceptanceStatus: 'accepted',
      })
      const folderDTO = result.data.find(item => item.name === FOLDER.name)
      expect(folderDTO).to.include({ name: FOLDER.name })
      const fileInFolderDTO = result.data.find(item => (item as FileGetDTO).uid === FILE_IN_FOLDER.uid)
      expect(fileInFolderDTO).to.include({ name: FILE_IN_FOLDER.name })
    })

    it('should fetch folder path when path field is requested and folderId is provided', async () => {
      const query = {
        scope: STATIC_SCOPE.PRIVATE,
        fields: { origin: false, path: true },
        folderId: FOLDER.id,
      } as UserFilePaginationDTO
      getFolderPathEntriesStub.withArgs(FOLDER.id).resolves([{ name: 'folder1', id: FOLDER.id }])

      const facade = getInstance()
      const result = await facade.retrieveAccessibleFiles(query)
      expect(result.data.length).to.equal(1)
      expect(getFolderPathEntriesStub.calledOnce).to.be.true()
      expect(getFolderPathEntriesStub.calledWith(FOLDER.id)).to.be.true()
      const fileInFolderDTO = result.data.find(item => (item as FileGetDTO).uid === FILE_IN_FOLDER.uid) as FileGetDTO
      expect(fileInFolderDTO).to.include({ name: FILE_IN_FOLDER.name })
      expect(fileInFolderDTO.folderPath).to.deep.equal([{ name: 'folder1', id: FOLDER.id }])
      expect(getParentFolderStub.notCalled).to.be.true()
    })

    it('should retrieve and map files and folders with path when path field is requested', async () => {
      const query = {
        scope: STATIC_SCOPE.PRIVATE,
        fields: { origin: false, path: true },
      } as UserFilePaginationDTO
      getParentFolderStub.withArgs(FILE_IN_FOLDER).returns(FOLDER)
      getFolderPathEntriesStub.withArgs(FOLDER.id).resolves([{ name: 'folder1', id: FOLDER.id }])

      const facade = getInstance()
      const result = await facade.retrieveAccessibleFiles(query)
      expect(result.data.length).to.equal(3)
      const fileInFolderDTO = result.data.find(item => (item as FileGetDTO).uid === FILE_IN_FOLDER.uid) as FileGetDTO
      expect(fileInFolderDTO).to.include({ name: FILE_IN_FOLDER.name })
      expect(fileInFolderDTO.folderPath).to.deep.equal([{ name: 'folder1', id: FOLDER.id }])
      expect(getParentFolderStub.calledWith(FILE_IN_FOLDER)).to.be.true()
      expect(getFolderPathEntriesStub.calledWith(FOLDER.id)).to.be.true()
    })

    it('should retrieve and map files with origin when origin field is requested', async () => {
      const query = {
        scope: STATIC_SCOPE.PRIVATE,
        fields: { origin: true, path: false },
      } as UserFilePaginationDTO

      const facade = getInstance()
      const result = await facade.retrieveAccessibleFiles(query)
      expect(result.data.length).to.equal(3)
      const fileDTO: FileGetDTO = result.data[0] as FileGetDTO
      expect(fileDTO).to.include({ name: FILE1.name })
      expect(fileDTO.origin).to.deep.equal(USER_UPLOAD_ORIGIN.origin)
      expect(fileDTO.originObject).to.deep.equal({
        originType: USER_UPLOAD_ORIGIN.parentType,
        originUid: USER_UPLOAD_ORIGIN.parentUid,
      })
      expect(resolveOriginStub.calledWith(FILE1)).to.be.true()
      const fileInFolderDTO: FileGetDTO = result.data.find(
        item => (item as FileGetDTO).uid === FILE_IN_FOLDER.uid,
      ) as FileGetDTO
      expect(fileInFolderDTO).to.include({ name: FILE_IN_FOLDER.name })
      expect(fileInFolderDTO.origin).to.deep.equal(USER_UPLOAD_ORIGIN.origin)
      expect(fileInFolderDTO.originObject).to.deep.equal({
        originType: USER_UPLOAD_ORIGIN.parentType,
        originUid: USER_UPLOAD_ORIGIN.parentUid,
      })
      expect(resolveOriginStub.calledWith(FILE_IN_FOLDER)).to.be.true()
    })

    it('should retrieve files in space scope', async () => {
      const query = {
        scope: SPACE.scope,
        fields: { origin: false, path: false },
      } as UserFilePaginationDTO

      const facade = getInstance()
      const result = await facade.retrieveAccessibleFiles(query)
      expect(result.data.length).to.equal(2)
      expect(spaceGetAccessibleByIdStub.calledWith(SPACE.id)).to.be.true()
      const fileDTO: FileGetDTO = result.data.find(item => (item as FileGetDTO).uid === SPACE_FILE.uid) as FileGetDTO
      expect(fileDTO).to.include({ name: SPACE_FILE.name })
      expect(fileDTO.scope).to.equal(SPACE.scope)
      expect(fileDTO.fileLicense).to.deep.equal({
        id: APPROVAL_PENDING_LICENSE.id,
        uid: `license-${APPROVAL_PENDING_LICENSE.id}`,
        title: APPROVAL_PENDING_LICENSE.title,
        approvalRequired: APPROVAL_PENDING_LICENSE.approvalRequired,
        acceptanceStatus: 'pending',
      })
      const folderDTO = result.data.find(item => item.name === SPACE_FOLDER.name)
      expect(folderDTO).to.include({ name: SPACE_FOLDER.name })
    })
  })

  function getInstance(): FileListRetrieveFacade {
    return new FileListRetrieveFacade(userContext, nodeService, nodeHelper, spaceService, licenseService)
  }
})
