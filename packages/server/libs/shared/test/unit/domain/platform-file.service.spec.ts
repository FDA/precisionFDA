import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { match, SinonStub, stub } from 'sinon'

describe('PlatformFileService', () => {
  describe('#createFile', () => {
    const NAME = 'name'
    const DESCRIPTION = 'description'
    const PROJECT = 'project'
    const DXID = 'dxid'
    const FILE_DESCRIBE = { name: NAME, description: DESCRIPTION, project: PROJECT }

    let clientCreateFileStub: SinonStub

    beforeEach(() => {
      clientCreateFileStub = stub().throws()
      clientCreateFileStub.withArgs(FILE_DESCRIBE).returns(DXID)
    })

    it('should not catch error from the client', async () => {
      const error = new Error('error')
      clientCreateFileStub = stub().throws(error)

      await expect(getInstance().createFile(FILE_DESCRIBE)).to.be.rejectedWith(error)
    })

    it('should proxy to platform client', async () => {
      await getInstance().createFile(FILE_DESCRIBE)

      expect(clientCreateFileStub.calledOnce).to.be.true()
    })

    function getInstance() {
      const platformClient = { fileCreate: clientCreateFileStub } as unknown as PlatformClient

      return new PlatformFileService(platformClient)
    }
  })

  describe('#uploadFileContent', () => {
    const UID = 'uid'
    const DXID = 'dxid'
    const FILE = { dxid: DXID, uid: UID }

    const CONTENT_PART_1_BYTESIZE = 50 * 1024 * 1024 // 50MB
    const CONTENT_PART_2_BYTESIZE = 10 * 1024 * 1024 // 10MB
    const CONTENT_PART_1 = 'A'.repeat(CONTENT_PART_1_BYTESIZE)
    const CONTENT_PART_2 = 'B'.repeat(CONTENT_PART_2_BYTESIZE)
    const CONTENT = CONTENT_PART_1 + CONTENT_PART_2

    const CONTENT_PART_1_HASH = '926c5d95165d63b8a4b85d82f3c91055'
    const CONTENT_PART_2_HASH = 'bf08f13f5b7b50662402b6ecef815ffd'

    const UPLOAD_URL_1 = 'upload url 1'
    const UPLOAD_URL_2 = 'upload url 2'
    const UPLOAD_HEADERS_1 = { someHeader: 1 }
    const UPLOAD_HEADERS_2 = { someHeader: 2 }

    const UPLOAD_URL_RESULT_1 = { url: UPLOAD_URL_1, headers: UPLOAD_HEADERS_1 }
    const UPLOAD_URL_RESULT_2 = { url: UPLOAD_URL_2, headers: UPLOAD_HEADERS_2 }
    let clientGetFileUploadUrlStub: SinonStub

    // It seems newer versions of nodejs initialize the fetch property on the global object lazily.
    // The stub does not work unless the fetch function has been accessed at least once before the stub.
    void fetch
    const fetchStub: SinonStub = stub(global, 'fetch')

    beforeEach(() => {
      clientGetFileUploadUrlStub = stub().throws()
      clientGetFileUploadUrlStub
        .withArgs({
          dxid: DXID,
          index: 1,
          md5: CONTENT_PART_1_HASH,
          size: CONTENT_PART_1_BYTESIZE,
        })
        .resolves(UPLOAD_URL_RESULT_1)
      clientGetFileUploadUrlStub
        .withArgs({
          dxid: DXID,
          index: 2,
          md5: CONTENT_PART_2_HASH,
          size: CONTENT_PART_2_BYTESIZE,
        })
        .resolves(UPLOAD_URL_RESULT_2)

      fetchStub.throws()
      fetchStub
        .withArgs(UPLOAD_URL_1, {
          method: 'PUT',
          body: match((val: Buffer) => val.toString() === CONTENT_PART_1),
          headers: UPLOAD_HEADERS_1,
        })
        .resolves(undefined)
      fetchStub
        .withArgs(UPLOAD_URL_2, {
          method: 'PUT',
          body: match((val: Buffer) => val.toString() === CONTENT_PART_2),
          headers: UPLOAD_HEADERS_2,
        })
        .resolves(undefined)
    })

    afterEach(() => {
      fetchStub.reset()
    })

    it('should not catch error from getFileUploadUrl', async () => {
      const error = new Error('my error')
      clientGetFileUploadUrlStub = stub().throws(error)

      await expect(getInstance().uploadFileContent(FILE as UserFile, CONTENT)).to.be.rejectedWith(
        error,
      )
    })

    it('should not catch error from fetch', async () => {
      const error = new Error('my error')
      fetchStub.resetBehavior()
      fetchStub.throws(error)

      await expect(getInstance().uploadFileContent(FILE as UserFile, CONTENT)).to.be.rejectedWith(
        error,
      )
    })

    it('should upload two parts', async () => {
      await getInstance().uploadFileContent(FILE as UserFile, CONTENT)

      expect(fetchStub.calledTwice).to.be.true()
    })

    it('should not upload anything with empty content', async () => {
      await getInstance().uploadFileContent(FILE as UserFile, '')

      expect(fetchStub.called).to.be.false()
    })

    it('should not upload anything with null content', async () => {
      await getInstance().uploadFileContent(FILE as UserFile, null)

      expect(fetchStub.called).to.be.false()
    })

    function getInstance() {
      const platformClient = {
        getFileUploadUrl: clientGetFileUploadUrlStub,
      } as unknown as PlatformClient

      return new PlatformFileService(platformClient)
    }
  })
})
