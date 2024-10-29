import { expect } from 'chai'
import { stub } from 'sinon'
import { LicensedItemService } from '@shared/domain/licensed-item/licensed-item.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'

describe('LicensedItemService', () => {
  const getLicensesForNodeStub = stub()
  const emTransactionalStub = stub().callsArg(0)
  const emRemoveStub = stub()

  const createLicensedItemService = () => {
    const em = {
      transactional: emTransactionalStub,
      remove: emRemoveStub,
    } as unknown as SqlEntityManager
    const licensedItemRepository = {
      getLicensesForNode: getLicensesForNodeStub,
    } as unknown as LicensedItemRepository

    return new LicensedItemService(em, licensedItemRepository)
  }

  describe('#removeItemLicensedForNode', () => {
    it('basic', async () => {
      getLicensesForNodeStub.resolves([{ id: 2 }])
      const licensedItemService = createLicensedItemService()

      await licensedItemService.removeItemLicensedForNode(1)

      expect(emTransactionalStub.calledOnce).to.be.true
      expect(getLicensesForNodeStub.calledOnce).to.be.true
      expect(emRemoveStub.calledOnce).to.be.true
      expect(getLicensesForNodeStub.firstCall.args[0]).to.equal(1)
      expect(emRemoveStub.firstCall.args[0].id).to.equal(2)
    })
  })
})
