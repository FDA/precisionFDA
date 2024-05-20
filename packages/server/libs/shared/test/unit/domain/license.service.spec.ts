import { LicenseService } from '@shared/domain/license/license.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { match, stub } from 'sinon'
import { expect } from 'chai'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { Node } from '@shared/domain/user-file/node.entity'

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

      const result = await service.findLicensedItemsByNodeUids(['1', '2'])

      expect(result).to.deep.equal([])
    })

    it('should return empty licenses for existing ids without licenses', async () => {
      findStub.withArgs(Node, match.any).resolves([1, 2])
      findStub.withArgs(LicensedItem, match.any, match.any).resolves([])
      const service = getInstance()

      const result = await service.findLicensedItemsByNodeUids(['1', '2'])

      expect(result).to.deep.equal([])
    })

    it('should return licenses for existing ids with licenses', async () => {
      findStub.withArgs(Node, match.any).resolves([1, 2])
      findStub
        .withArgs(LicensedItem, match.any, match.any)
        .resolves([
          { license: { getEntity: () => 'license1' } },
          { license: { getEntity: () => 'license2' } },
        ])
      const service = getInstance()

      const result = await service.findLicensedItemsByNodeUids(['1', '2'])

      expect(result).to.deep.equal(['license1', 'license2'])
    })
  })

  const em = {
    find: findStub,
  } as unknown as SqlEntityManager

  function getInstance() {
    return new LicenseService(em)
  }
})
