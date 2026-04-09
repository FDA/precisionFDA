import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NotFoundError } from '@shared/errors'
import { CliFileDownloadFacade } from '../../../src/facade/cli/cli-file-download.facade'
import { UserFileDownloadFacade } from '../../../src/facade/user-file/user-file-download.facade'

const FILE_UID = 'file-Gxxxxxxxxxxxxxxxx-1' as Uid<'file'>
const DOWNLOAD_URL = 'https://example.com/download/file-123'
const FILE_SIZE = 4096

function createFile(overrides: Record<string, unknown> = {}): Partial<UserFile> {
  return {
    uid: FILE_UID,
    fileSize: FILE_SIZE,
    ...overrides,
  }
}

describe('CliFileDownloadFacade', () => {
  let getUserFileOrAssetStub: SinonStub
  let getDownloadLinkStub: SinonStub
  let facade: CliFileDownloadFacade

  beforeEach(() => {
    getUserFileOrAssetStub = stub().resolves(createFile())
    getDownloadLinkStub = stub().resolves(DOWNLOAD_URL)

    const nodeService = {
      getUserFileOrAsset: getUserFileOrAssetStub,
    } as unknown as NodeService

    const userFileDownloadFacade = {
      getDownloadLink: getDownloadLinkStub,
    } as unknown as UserFileDownloadFacade

    facade = new CliFileDownloadFacade(nodeService, userFileDownloadFacade)
  })

  it('looks up the file by UID', async () => {
    await facade.getDownloadLink(FILE_UID)

    expect(getUserFileOrAssetStub.calledOnce).to.be.true()
    expect(getUserFileOrAssetStub.firstCall.args[0]).to.equal(FILE_UID)
  })

  it('calls userFileDownloadFacade.getDownloadLink with the UID and empty options', async () => {
    await facade.getDownloadLink(FILE_UID)

    expect(getDownloadLinkStub.calledOnce).to.be.true()
    expect(getDownloadLinkStub.firstCall.args[0]).to.equal(FILE_UID)
    expect(getDownloadLinkStub.firstCall.args[1]).to.deep.equal({})
  })

  it('returns fileUrl and fileSize on success', async () => {
    const result = await facade.getDownloadLink(FILE_UID)

    expect(result).to.deep.equal({
      fileUrl: DOWNLOAD_URL,
      fileSize: FILE_SIZE,
    })
  })

  it('throws NotFoundError when file is not found', async () => {
    getUserFileOrAssetStub.resolves(null)

    try {
      await facade.getDownloadLink(FILE_UID)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).to.be.instanceOf(NotFoundError)
      expect((err as Error).message).to.include('not found')
    }
  })

  it('does not call getDownloadLink when file is not found', async () => {
    getUserFileOrAssetStub.resolves(null)

    try {
      await facade.getDownloadLink(FILE_UID)
    } catch {
      // expected
    }

    expect(getDownloadLinkStub.called).to.be.false()
  })

  it('returns the correct fileSize from the file entity', async () => {
    const largeFileSize = 1_073_741_824
    getUserFileOrAssetStub.resolves(createFile({ fileSize: largeFileSize }))

    const result = await facade.getDownloadLink(FILE_UID)

    expect(result.fileSize).to.equal(largeFileSize)
  })
})
