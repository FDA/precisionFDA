import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ProfileService } from '@shared/domain/profile/service/profile.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PermissionError } from '@shared/errors'
import { ProfileUpdateFacade } from '@shared/facade/profile/profile-update.facade'
import { Organization } from '@shared/domain/org/organization.entity'

describe('ProfileUpdateFacade', () => {
  const populateStub = stub()
  const flushStub = stub()
  const loadEntityStub = stub()
  const updateProfileStub = stub()

  const em = {
    populate: populateStub,
    flush: flushStub,
  } as unknown as EntityManager

  const userCtx = {
    loadEntity: loadEntityStub,
  } as unknown as UserContext

  const profileService = {
    updateProfile: updateProfileStub,
  } as unknown as ProfileService

  beforeEach(() => {
    populateStub.reset()
    populateStub.resolves()
    flushStub.reset()
    flushStub.resolves()
    loadEntityStub.reset()
    updateProfileStub.reset()
  })

  function getInstance(): ProfileUpdateFacade {
    return new ProfileUpdateFacade(em, userCtx, profileService)
  }

  describe('#updateProfile', () => {
    it('delegates to profile service', async () => {
      const user = { id: 1 }
      const dto = { email: 'new@example.com' }
      const expected = { emailConfirmed: false, email: 'new@example.com' }

      loadEntityStub.resolves(user)
      updateProfileStub.resolves(expected)

      const facade = getInstance()
      const result = await facade.updateProfile(dto)

      expect(result).to.deep.equal(expected)
      expect(updateProfileStub.calledOnce).to.equal(true)
      expect(updateProfileStub.firstCall.args[0]).to.equal(user)
      expect(updateProfileStub.firstCall.args[1]).to.equal(dto)
    })
  })

  describe('#updateTimeZone', () => {
    it('sets time zone on user and flushes', async () => {
      const user = { id: 1, timeZone: null as string | null }
      loadEntityStub.resolves(user)

      const facade = getInstance()
      await facade.updateTimeZone('US/Pacific')

      expect(user.timeZone).to.equal('US/Pacific')
      expect(flushStub.calledOnce).to.equal(true)
    })
  })

  describe('#updateOrganizationName', () => {
    it('updates org name when user is admin', async () => {
      const org = { id: 10, name: 'Old Name', admin: { id: 1 } } as Organization
      const user = {
        id: 1,
        organization: { getEntity: (): Organization => org },
      }

      loadEntityStub.resolves(user)

      const facade = getInstance()
      const result = await facade.updateOrganizationName('New Name')

      expect(result.name).to.equal('New Name')
      expect(org.name).to.equal('New Name')
      expect(flushStub.calledOnce).to.equal(true)
    })

    it('throws PermissionError when user is not admin', async () => {
      const org = { id: 10, name: 'Old Name', admin: { id: 99 } } as Organization
      const user = {
        id: 1,
        organization: { getEntity: (): Organization => org },
      }

      loadEntityStub.resolves(user)

      const facade = getInstance()

      try {
        await facade.updateOrganizationName('New Name')
        expect.fail('Expected PermissionError to be thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }

      expect(flushStub.called).to.equal(false)
      expect(org.name).to.equal('Old Name')
    })
  })
})
