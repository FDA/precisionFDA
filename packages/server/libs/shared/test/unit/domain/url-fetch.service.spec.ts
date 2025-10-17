import { UrlFetchService } from '@shared/domain/user-file/service/url-fetch.service'
import { PlatformClient } from '@shared/platform-client'
import { stub } from 'sinon'
import { expect } from 'chai'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'

describe('UrlFetchService', () => {
  const nodeRepoFindOneOrFailStub = stub()
  const userClientGetFileUploadUrlStub = stub()
  const challengeBotClientGetFileUploadUrlStub = stub()

  const nodeRepo = {
    findOneOrFail: nodeRepoFindOneOrFailStub,
  } as unknown as NodeRepository

  const userClient = {
    getFileUploadUrl: userClientGetFileUploadUrlStub,
  } as unknown as PlatformClient

  const challengeBotClient = {
    getFileUploadUrl: challengeBotClientGetFileUploadUrlStub,
  } as unknown as PlatformClient

  beforeEach(() => {
    nodeRepoFindOneOrFailStub.reset()
    nodeRepoFindOneOrFailStub.throws()

    userClientGetFileUploadUrlStub.reset()
    userClientGetFileUploadUrlStub.throws()

    challengeBotClientGetFileUploadUrlStub.reset()
    challengeBotClientGetFileUploadUrlStub.throws()
  })

  const service = getInstance()
  const fileUid = 'file-12345-1'
  const index = 1
  const md5 = 'abcde12345fghij67890klmno'
  const size = 1024

  const expectedResponse = {
    url: 'https://example.com/upload',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    expires: Date.now() + 3600 * 1000,
  }

  describe('getUploadUrl', async () => {
    it('user platform client', async () => {
      nodeRepoFindOneOrFailStub.withArgs({ uid: fileUid }, { populate: ['user'] }).resolves({
        stiType: FILE_STI_TYPE.USERFILE,
        isCreatedByChallengeBot: () => false,
        challengeResources: {
          load: async () => {},
        },
      } as unknown as UserFile)

      userClientGetFileUploadUrlStub
        .withArgs({
          dxid: 'file-12345',
          index,
          md5,
          size,
        })
        .resolves(expectedResponse)

      const response = await service.getUploadUrl(fileUid, index, md5, size)
      expect(response).to.deep.equal(expectedResponse)
      expect(userClientGetFileUploadUrlStub.calledOnce).to.be.true()
    })

    it('challenge bot platform client', async () => {
      nodeRepoFindOneOrFailStub.withArgs({ uid: fileUid }, { populate: ['user'] }).resolves({
        stiType: FILE_STI_TYPE.USERFILE,
        isCreatedByChallengeBot: () => true,
        challengeResources: {
          load: async () => {},
        },
      } as unknown as UserFile)

      challengeBotClientGetFileUploadUrlStub
        .withArgs({
          dxid: 'file-12345',
          index,
          md5,
          size,
        })
        .resolves(expectedResponse)

      const response = await service.getUploadUrl(fileUid, index, md5, size)
      expect(response).to.deep.equal(expectedResponse)
      expect(challengeBotClientGetFileUploadUrlStub.calledOnce).to.be.true()
    })

    it('asset', async () => {
      nodeRepoFindOneOrFailStub.withArgs({ uid: fileUid }, { populate: ['user'] }).resolves({
        stiType: FILE_STI_TYPE.ASSET,
      } as unknown as UserFile)

      userClientGetFileUploadUrlStub
        .withArgs({
          dxid: 'file-12345',
          index,
          md5,
          size,
        })
        .resolves(expectedResponse)

      const response = await service.getUploadUrl(fileUid, index, md5, size)
      expect(response).to.deep.equal(expectedResponse)
      expect(userClientGetFileUploadUrlStub.calledOnce).to.be.true()
    })
  })

  function getInstance(): UrlFetchService {
    return new UrlFetchService(nodeRepo, userClient, challengeBotClient)
  }
})
