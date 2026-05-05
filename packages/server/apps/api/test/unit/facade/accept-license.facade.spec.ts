import { expect } from 'chai'
import { stub } from 'sinon'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { LicenseService } from '@shared/domain/license/license.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AcceptLicenseFacade } from '../../../src/facade/license/accept-license.facade'

describe('AcceptLicenseFacade', () => {
  const USER_ID = 100
  const LICENSE_ID = 42
  const LICENSE = { id: LICENSE_ID, title: 'Test License' }
  const USER = { id: USER_ID }

  const loadEntityStub = stub()
  const findAccessibleByIdsStub = stub()
  const acceptIfNotYetAcceptedStub = stub()

  beforeEach(() => {
    loadEntityStub.reset()
    loadEntityStub.throws()

    findAccessibleByIdsStub.reset()
    findAccessibleByIdsStub.throws()

    acceptIfNotYetAcceptedStub.reset()
    acceptIfNotYetAcceptedStub.throws()
  })

  describe('#accept', () => {
    it('should accept a license', async () => {
      loadEntityStub.resolves(USER)
      findAccessibleByIdsStub.resolves([LICENSE])
      acceptIfNotYetAcceptedStub.resolves()

      const facade = getInstance()
      await facade.accept(LICENSE_ID)

      expect(acceptIfNotYetAcceptedStub.calledOnce).to.be.true()
      expect(acceptIfNotYetAcceptedStub.getCall(0).args[0]).to.deep.equal([LICENSE])
      expect(acceptIfNotYetAcceptedStub.getCall(0).args[1]).to.equal(USER)
    })

    it('should throw NotFoundException when license is not accessible', async () => {
      loadEntityStub.resolves(USER)
      findAccessibleByIdsStub.resolves([])

      const facade = getInstance()

      await expect(facade.accept(LICENSE_ID)).to.be.rejectedWith(
        'License with id 42 not found or not accessible',
      )
    })
  })

  describe('#acceptMany', () => {
    it('should accept multiple licenses', async () => {
      const LICENSE_2 = { id: 43, title: 'Test License 2' }
      loadEntityStub.resolves(USER)
      findAccessibleByIdsStub.resolves([LICENSE, LICENSE_2])
      acceptIfNotYetAcceptedStub.resolves()

      const facade = getInstance()
      const result = await facade.acceptMany([LICENSE_ID, 43])

      expect(result).to.deep.equal([LICENSE_ID, 43])
      expect(acceptIfNotYetAcceptedStub.calledOnce).to.be.true()
      expect(acceptIfNotYetAcceptedStub.getCall(0).args[0]).to.deep.equal([LICENSE, LICENSE_2])
    })

    it('should deduplicate license IDs', async () => {
      loadEntityStub.resolves(USER)
      findAccessibleByIdsStub.resolves([LICENSE])
      acceptIfNotYetAcceptedStub.resolves()

      const facade = getInstance()
      const result = await facade.acceptMany([LICENSE_ID, LICENSE_ID])

      expect(result).to.deep.equal([LICENSE_ID])
      expect(findAccessibleByIdsStub.getCall(0).args[0]).to.deep.equal([LICENSE_ID])
    })

    it('should throw BadRequestException for empty array', async () => {
      const facade = getInstance()

      await expect(facade.acceptMany([])).to.be.rejectedWith('licenseIds must be a non-empty array')
    })

    it('should throw NotFoundException when some licenses do not exist', async () => {
      loadEntityStub.resolves(USER)
      findAccessibleByIdsStub.resolves([LICENSE])

      const facade = getInstance()

      await expect(facade.acceptMany([LICENSE_ID, 999])).to.be.rejectedWith(
        'Some licenseIds do not exist or are not accessible',
      )
    })
  })

  function getInstance(): AcceptLicenseFacade {
    const userCtx = { id: USER_ID, loadEntity: loadEntityStub } as unknown as UserContext

    const licenseService = {
      findAccessibleByIds: findAccessibleByIdsStub,
    } as unknown as LicenseService

    const acceptedLicenseService = {
      acceptIfNotYetAccepted: acceptIfNotYetAcceptedStub,
    } as unknown as AcceptedLicenseService

    return new AcceptLicenseFacade(userCtx, licenseService, acceptedLicenseService)
  }
})
