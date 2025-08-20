import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { UserFileDownloadFacade } from 'apps/api/src/facade/user-file/user-file-download.facade'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'
import { NotFoundError, PermissionError, ValidationError } from '@shared/errors'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'

describe('UserFileDownloadFacade', () => {
  const FILE_UID: Uid<'file'> = 'file-dxid-1'
  const SPACE_ID = 456
  const DOWNLOAD_LINK = 'https://precisionfda.com/download/file_123.txt'

  let getUserFileStub: SinonStub
  let getDownloadLinkStub: SinonStub
  let canUserDownloadFromStub: SinonStub

  beforeEach(() => {
    getUserFileStub = stub().throws()
    getDownloadLinkStub = stub().resolves(DOWNLOAD_LINK)
    canUserDownloadFromStub = stub().resolves()
  })

  it('should generate download link for closed file in private scope', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: false })
    getUserFileStub.withArgs(FILE_UID).resolves(file)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }
    const result = await getInstance().getDownloadLink(FILE_UID, options)

    expect(result).to.equal(DOWNLOAD_LINK)
    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(getDownloadLinkStub.calledOnceWith(file, options)).to.be.true
    expect(canUserDownloadFromStub.called).to.be.false
  })

  it('should generate download link for closed file in space without preauthentication', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: true, spaceId: SPACE_ID })
    getUserFileStub.withArgs(FILE_UID).resolves(file)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }
    const result = await getInstance().getDownloadLink(FILE_UID, options)

    expect(result).to.equal(DOWNLOAD_LINK)
    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(getDownloadLinkStub.calledOnceWith(file, options)).to.be.true
    expect(canUserDownloadFromStub.called).to.be.false
  })

  it('should generate download link for closed file in space with preauthentication', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: true, spaceId: SPACE_ID })
    getUserFileStub.withArgs(FILE_UID).resolves(file)
    canUserDownloadFromStub.withArgs(SPACE_ID).resolves(true)

    const options: DownloadLinkOptionsDto = { preauthenticated: true }
    const result = await getInstance().getDownloadLink(FILE_UID, options)

    expect(result).to.equal(DOWNLOAD_LINK)
    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(canUserDownloadFromStub.calledOnceWith(SPACE_ID)).to.be.true
    expect(getDownloadLinkStub.calledOnceWith(file, options)).to.be.true
  })

  it('should not validate space access when preauthenticated is false for space file', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: true, spaceId: SPACE_ID })
    getUserFileStub.withArgs(FILE_UID).resolves(file)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }
    const result = await getInstance().getDownloadLink(FILE_UID, options)

    expect(result).to.equal(DOWNLOAD_LINK)
    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(getDownloadLinkStub.calledOnceWith(file, options)).to.be.true
    expect(canUserDownloadFromStub.called).to.be.false
  })

  it('should not validate space access for private scope file even with preauthentication', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: false })
    getUserFileStub.withArgs(FILE_UID).resolves(file)

    const options: DownloadLinkOptionsDto = { preauthenticated: true }
    const result = await getInstance().getDownloadLink(FILE_UID, options)

    expect(result).to.equal(DOWNLOAD_LINK)
    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(getDownloadLinkStub.calledOnceWith(file, options)).to.be.true
    expect(canUserDownloadFromStub.called).to.be.false
  })

  it('should throw NotFoundError when file does not exist', async () => {
    getUserFileStub.withArgs(FILE_UID).resolves(null)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }

    await expect(getInstance().getDownloadLink(FILE_UID, options)).to.be.rejectedWith(
      NotFoundError,
      `File with UID ${FILE_UID} not found`,
    )

    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
  })

  it('should throw ValidationError when file is in open state', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.OPEN, isInSpace: false })
    getUserFileStub.withArgs(FILE_UID).resolves(file)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }

    await expect(getInstance().getDownloadLink(FILE_UID, options)).to.be.rejectedWith(
      ValidationError,
      "Files can only be downloaded if they are in the 'closed' state",
    )

    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
  })

  it('should throw ValidationError when space validation fails for preauthenticated download', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: true, spaceId: SPACE_ID })
    const error = new PermissionError(
      'You have no permissions to download this file as it is part of a protected space.',
    )

    getUserFileStub.withArgs(FILE_UID).resolves(file)
    canUserDownloadFromStub.reset()
    canUserDownloadFromStub.withArgs(SPACE_ID).throws(error)

    const options: DownloadLinkOptionsDto = { preauthenticated: true }

    await expect(getInstance().getDownloadLink(FILE_UID, options)).to.be.rejectedWith(
      PermissionError,
      'You have no permissions to download this file as it is part of a protected space.',
    )

    expect(getUserFileStub.calledOnceWith(FILE_UID)).to.be.true
    expect(canUserDownloadFromStub.calledOnceWith(SPACE_ID)).to.be.true
  })

  it('should not catch error from getUserFile', async () => {
    const error = new Error('Database connection failed')
    getUserFileStub.reset()
    getUserFileStub.throws(error)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }

    await expect(getInstance().getDownloadLink(FILE_UID, options)).to.be.rejectedWith(error)
  })

  it('should not catch error from getDownloadLink', async () => {
    const file = createMockFile({ state: FILE_STATE_DX.CLOSED, isInSpace: false })
    const error = new NotFoundError()

    getUserFileStub.withArgs(FILE_UID).resolves(file)
    getDownloadLinkStub.reset()
    getDownloadLinkStub.throws(error)

    const options: DownloadLinkOptionsDto = { preauthenticated: false }

    await expect(getInstance().getDownloadLink(FILE_UID, options)).to.be.rejectedWith(error)
  })

  it('should handle different file types in closed state', async () => {
    const file = createMockFile({
      state: FILE_STATE_DX.CLOSED,
      isInSpace: false,
      name: 'image.jpg',
    })

    // Test file
    getUserFileStub.withArgs(FILE_UID).resolves(file)
    const imageOptions: DownloadLinkOptionsDto = { preauthenticated: false }

    const result1 = await getInstance().getDownloadLink(FILE_UID, imageOptions)
    expect(result1).to.equal(DOWNLOAD_LINK)
  })

  function createMockFile(options: {
    state: FILE_STATE_DX
    isInSpace: boolean
    spaceId?: number
    name?: string
  }): UserFile {
    return {
      uid: FILE_UID,
      state: options.state,
      name: options.name || 'test_file.pdf',
      isInSpace: () => options.isInSpace,
      getSpaceId: () => options.spaceId || null,
    } as unknown as UserFile
  }

  function getInstance(): UserFileDownloadFacade {
    const userFileService = {
      getUserFile: getUserFileStub,
      getDownloadLink: getDownloadLinkStub,
    } as unknown as UserFileService

    const spaceService = {
      canUserDownloadFrom: canUserDownloadFromStub,
    } as unknown as SpaceService

    return new UserFileDownloadFacade(userFileService, spaceService)
  }
})
