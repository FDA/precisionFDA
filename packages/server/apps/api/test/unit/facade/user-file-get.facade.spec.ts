import { UserFileGetFacade } from 'apps/api/src/facade/user-file/user-file-get.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { LicenseService } from '@shared/domain/license/license.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { NotFoundError } from '@shared/errors'

describe('UserFileGetFacade', () => {
  const userFileServiceGetAccessibleFileByUidStub = stub()
  const licenseServiceFindLicensesForNodeIdsStub = stub()
  const spaceServiceGetAccessibleSpaceStub = stub()
  const acceptedLicenseServiceGetLicenseAcceptanceStatusForUserStub = stub()
  const nodeHelperGetParentFolderStub = stub()
  const nodeHelperGetFolderPathEntriesStub = stub()
  const nodeHelperResolveOriginStub = stub()
  const mapToDTOStub = stub(FileGetDTO, 'mapToDTO')

  beforeEach(() => {
    userFileServiceGetAccessibleFileByUidStub.reset()
    licenseServiceFindLicensesForNodeIdsStub.reset()
    spaceServiceGetAccessibleSpaceStub.reset()
    acceptedLicenseServiceGetLicenseAcceptanceStatusForUserStub.reset()
    nodeHelperGetParentFolderStub.reset()
    nodeHelperGetFolderPathEntriesStub.reset()
    nodeHelperResolveOriginStub.reset()
    mapToDTOStub.reset()
  })

  after(() => {
    mapToDTOStub.restore()
  })

  it('throws when file is not found', async () => {
    userFileServiceGetAccessibleFileByUidStub.resolves(null)

    await expect(getInstance().getFile('file-G111-1')).to.be.rejectedWith(
      NotFoundError,
      'File file-G111-1 not found or not accessible',
    )
  })

  it('fetches data through services and maps DTO', async () => {
    const file = {
      id: 7,
      uid: 'file-G111-1',
      parentType: PARENT_TYPE.JOB,
      parentId: 99,
      isInSpace: () => true,
      getSpaceId: () => 11,
    }

    const license = {
      id: 3,
      approvalRequired: true,
    }

    const mappedDto = { uid: 'file-G111-1' } as unknown as FileGetDTO

    userFileServiceGetAccessibleFileByUidStub.resolves(file)
    licenseServiceFindLicensesForNodeIdsStub.withArgs([7]).resolves([license])
    acceptedLicenseServiceGetLicenseAcceptanceStatusForUserStub.withArgs(3).resolves('pending')
    spaceServiceGetAccessibleSpaceStub.withArgs(11).resolves({ id: 11 })

    nodeHelperGetParentFolderStub.returns({ id: 21 })
    nodeHelperGetFolderPathEntriesStub.withArgs(21).resolves([{ id: 21, name: 'parent-folder' }])
    nodeHelperResolveOriginStub.resolves({
      origin: { text: 'job-name' },
      parentType: 'Job',
      parentUid: 'job-G111-1',
    })

    mapToDTOStub.returns(mappedDto)

    const result = await getInstance().getFile('file-G111-1')

    expect(userFileServiceGetAccessibleFileByUidStub.calledOnce).to.equal(true)
    expect(licenseServiceFindLicensesForNodeIdsStub.calledOnceWithExactly([7])).to.equal(true)
    expect(acceptedLicenseServiceGetLicenseAcceptanceStatusForUserStub.calledOnceWithExactly(3)).to.equal(true)
    expect(spaceServiceGetAccessibleSpaceStub.calledOnceWithExactly(11)).to.equal(true)
    expect(nodeHelperGetFolderPathEntriesStub.calledOnceWithExactly(21)).to.equal(true)
    expect(nodeHelperResolveOriginStub.calledOnce).to.equal(true)
    expect(mapToDTOStub.calledOnce).to.equal(true)
    expect(result).to.equal(mappedDto)
  })

  function getInstance(): UserFileGetFacade {
    const userFileService = {
      getAccessibleFileByUid: userFileServiceGetAccessibleFileByUidStub,
    } as unknown as UserFileService
    const licenseService = {
      findLicensesForNodeIds: licenseServiceFindLicensesForNodeIdsStub,
    } as unknown as LicenseService
    const spaceService = {
      getAccessibleById: spaceServiceGetAccessibleSpaceStub,
    } as unknown as SpaceService
    const acceptedLicenseService = {
      getLicenseAcceptanceStatusForUser: acceptedLicenseServiceGetLicenseAcceptanceStatusForUserStub,
    } as unknown as AcceptedLicenseService
    const nodeHelper = {
      getParentFolder: nodeHelperGetParentFolderStub,
      getFolderPathEntries: nodeHelperGetFolderPathEntriesStub,
      resolveOrigin: nodeHelperResolveOriginStub,
    } as unknown as NodeHelper

    const UserFileGetFacadeCtor = UserFileGetFacade as unknown as new (...args: unknown[]) => UserFileGetFacade
    return new UserFileGetFacadeCtor(userFileService, licenseService, acceptedLicenseService, spaceService, nodeHelper)
  }
})
