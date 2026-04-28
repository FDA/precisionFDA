import { EntityManager } from '@mikro-orm/mysql';
import { expect } from 'chai';
import { stub } from 'sinon';
import { OrgActionRequestService } from '@shared/domain/org-action-request/org-action-request.service';
import { Organization } from '@shared/domain/org/organization.entity';
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity';
import { UserService } from '@shared/domain/user/service/user.service';
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors';
import { OrgMemberActionFacade } from '@shared/facade/profile/org-member-action.facade';
import { Ref } from '@mikro-orm/core'


describe('OrgMemberActionFacade', () => {
  const populateStub = stub()
  const flushStub = stub()
  const loadEntityStub = stub()
  const getUserInOrganizationStub = stub()
  const findPendingRemoveMemberRequestStub = stub()
  const createRemoveMemberRequestStub = stub()

  const em = {
    populate: populateStub,
    flush: flushStub,
  } as unknown as EntityManager

  const userCtx = {
    loadEntity: loadEntityStub,
  } as unknown as UserContext

  const userService = {
    getUserInOrganization: getUserInOrganizationStub,
  } as unknown as UserService

  const orgActionRequestService = {
    findPendingRemoveMemberRequest: findPendingRemoveMemberRequestStub,
    createRemoveMemberRequest: createRemoveMemberRequestStub,
  } as unknown as OrgActionRequestService

  const ORG = {
    id: 10,
    singular: false,
    admin: { id: 1 },
  } as Organization

  const ADMIN_USER = {
    id: 1,
    organization: { getEntity: (): Organization => ORG },
  }

  beforeEach(() => {
    populateStub.reset()
    populateStub.resolves()
    flushStub.reset()
    flushStub.resolves()
    loadEntityStub.reset()
    loadEntityStub.resolves(ADMIN_USER)
    getUserInOrganizationStub.reset()
    findPendingRemoveMemberRequestStub.reset()
    findPendingRemoveMemberRequestStub.resolves(null)
    createRemoveMemberRequestStub.reset()
    createRemoveMemberRequestStub.resolves()
  })

  function getInstance(): OrgMemberActionFacade {
    return new OrgMemberActionFacade(em, userCtx, userService, orgActionRequestService)
  }

  describe('#deactivateOrgUser', () => {
    it('deactivates an enabled member', async () => {
      const targetUser = { id: 5, userState: USER_STATE.ENABLED }
      getUserInOrganizationStub.resolves(targetUser)

      const facade = getInstance()
      await facade.deactivateOrgUser(5)

      expect(targetUser.userState).to.equal(USER_STATE.DEACTIVATED)
      expect(flushStub.calledOnce).to.equal(true)
    })

    it('throws NotFoundError when user is not in org', async () => {
      getUserInOrganizationStub.resolves(null)

      const facade = getInstance()

      try {
        await facade.deactivateOrgUser(999)
        expect.fail('Expected NotFoundError')
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError)
      }
    })

    it('throws PermissionError when targeting the org admin', async () => {
      const adminTarget = { id: 1, userState: USER_STATE.ENABLED }
      getUserInOrganizationStub.resolves(adminTarget)

      const facade = getInstance()

      try {
        await facade.deactivateOrgUser(1)
        expect.fail('Expected PermissionError')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }
    })

    it('throws InvalidStateError when user is already deactivated', async () => {
      const deactivatedUser = { id: 5, userState: USER_STATE.DEACTIVATED }
      getUserInOrganizationStub.resolves(deactivatedUser)

      const facade = getInstance()

      try {
        await facade.deactivateOrgUser(5)
        expect.fail('Expected InvalidStateError')
      } catch (err) {
        expect(err).to.be.instanceOf(InvalidStateError)
      }
    })

    it('throws PermissionError when caller is not org admin', async () => {
      const nonAdminUser = {
        id: 2,
        organization: {
          getEntity: (): Organization => ({ id: 10, singular: false, admin: { id: 1 } as Ref<User> } as Organization),
        },
      }
      loadEntityStub.resolves(nonAdminUser)

      const facade = getInstance()

      try {
        await facade.deactivateOrgUser(5)
        expect.fail('Expected PermissionError')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }

      expect(getUserInOrganizationStub.called).to.equal(false)
    })

    it('throws PermissionError for singular org', async () => {
      const singularUser = {
        id: 1,
        organization: {
          getEntity: (): Organization => ({ id: 20, singular: true, admin: { id: 1 } as Ref<User> } as Organization),
        },
      }
      loadEntityStub.resolves(singularUser)

      const facade = getInstance()

      try {
        await facade.deactivateOrgUser(5)
        expect.fail('Expected PermissionError')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }
    })
  })

  describe('#removeOrgMember', () => {
    it('creates a removal request for a valid member', async () => {
      const targetUser = { id: 5, userState: USER_STATE.ENABLED }
      getUserInOrganizationStub.resolves(targetUser)
      findPendingRemoveMemberRequestStub.resolves(null)

      const facade = getInstance()
      await facade.removeOrgMember(5)

      expect(createRemoveMemberRequestStub.calledOnceWithExactly(ORG.id, ADMIN_USER.id, 5)).to.equal(true)
    })

    it('throws NotFoundError when user is not in org', async () => {
      getUserInOrganizationStub.resolves(null)

      const facade = getInstance()

      try {
        await facade.removeOrgMember(999)
        expect.fail('Expected NotFoundError')
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError)
      }
    })

    it('throws PermissionError when targeting the org admin', async () => {
      const adminTarget = { id: 1, userState: USER_STATE.ENABLED }
      getUserInOrganizationStub.resolves(adminTarget)

      const facade = getInstance()

      try {
        await facade.removeOrgMember(1)
        expect.fail('Expected PermissionError')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }
    })

    it('throws InvalidStateError when a pending request already exists', async () => {
      const targetUser = { id: 5, userState: USER_STATE.ENABLED }
      getUserInOrganizationStub.resolves(targetUser)
      findPendingRemoveMemberRequestStub.resolves({ id: 50 })

      const facade = getInstance()

      try {
        await facade.removeOrgMember(5)
        expect.fail('Expected InvalidStateError')
      } catch (err) {
        expect(err).to.be.instanceOf(InvalidStateError)
      }

      expect(createRemoveMemberRequestStub.called).to.equal(false)
    })

    it('throws PermissionError when caller is not org admin', async () => {
      const nonAdminUser = {
        id: 2,
        organization: {
          getEntity: (): Organization => ({ id: 10, singular: false, admin: { id: 1 } as Ref<User> } as Organization),
        },
      }
      loadEntityStub.resolves(nonAdminUser)

      const facade = getInstance()

      try {
        await facade.removeOrgMember(5)
        expect.fail('Expected PermissionError')
      } catch (err) {
        expect(err).to.be.instanceOf(PermissionError)
      }

      expect(getUserInOrganizationStub.called).to.equal(false)
    })
  })
})
