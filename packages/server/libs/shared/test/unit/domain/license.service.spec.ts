import { expect } from 'chai'
import { stub } from 'sinon'
import { LicenseService } from '@shared/domain/license/license.service'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'

describe('LicenseService', () => {
  const findStub = stub()

  beforeEach(() => {
    findStub.reset()
    findStub.throws()
  })

  describe('#findLicensedItemsByNodeUids', () => {
    it('should return empty licenses for non existing ids', async () => {
      findStub.resolves([])
      const service = getInstance()

      const result = await service.findLicensedItemsByNodeUids(['file-a-1', 'file-b-2'])

      expect(result).to.deep.equal([])
    })

    it('should return empty licenses for existing ids without licenses', async () => {
      findStub.onFirstCall().resolves([1, 2])
      findStub.onSecondCall().resolves([])
      const service = getInstance()

      const result = await service.findLicensedItemsByNodeUids(['file-a-1', 'file-b-2'])

      expect(result).to.deep.equal([])
    })

    it('should return licenses for existing ids with licenses', async () => {
      findStub.onFirstCall().resolves([1, 2])
      findStub
        .onSecondCall()
        .resolves([
          { license: { getEntity: (): string => 'license1' } },
          { license: { getEntity: (): string => 'license2' } },
        ])
      const service = getInstance()

      const result = await service.findLicensedItemsByNodeUids(['file-a-1', 'file-b-2'])

      expect(result).to.deep.equal(['license1', 'license2'])
    })
  })

  const licensedItemRepo = { find: findStub } as unknown as LicensedItemRepository
  const nodeRepo = { find: findStub } as unknown as NodeRepository

  function getInstance(): LicenseService {
    return new LicenseService(licensedItemRepo, nodeRepo)
  }
})
