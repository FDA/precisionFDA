import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { AdminMembershipService } from '@shared/domain/admin-membership/service/admin-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { InvalidStateError, PermissionError } from '@shared/errors'
import { RemoveAdminMembershipFacade } from '@shared/facade/admin-membership/remove-admin-membership.facade'
import { PlatformClient } from '@shared/platform-client'

describe('RemoveAdminMembershipFacade', () => {
  const transactionalStub = stub()
  const findMembershipStub = stub()
  const removeRecordStub = stub()
  const findAdminSpacesStub = stub()
  const deactivateAdminSpaceStub = stub()
  const removeUserFromOrgStub = stub()
  const findActiveLeadMembershipsStub = stub()

  const em = {
    transactional: transactionalStub,
  } as unknown as SqlEntityManager

  const adminMembershipService = {
    findMembership: findMembershipStub,
    removeRecord: removeRecordStub,
  } as unknown as AdminMembershipService

  const spaceService = {
    findAdminSpaces: findAdminSpacesStub,
  } as unknown as SpaceService

  const spaceMembershipService = {
    deactivateAdminSpaceMembership: deactivateAdminSpaceStub,
    findActiveLeadMembershipsInAdminSpaces: findActiveLeadMembershipsStub,
  } as unknown as SpaceMembershipService

  const adminClient = {
    removeUserFromOrganization: removeUserFromOrgStub,
  } as unknown as PlatformClient

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.callsFake(async (callback: () => Promise<unknown>) => callback())

    findMembershipStub.reset()
    findMembershipStub.throws()

    removeRecordStub.reset()
    removeRecordStub.returns(undefined)

    findAdminSpacesStub.reset()
    findAdminSpacesStub.throws()

    deactivateAdminSpaceStub.reset()
    deactivateAdminSpaceStub.throws()

    removeUserFromOrgStub.reset()
    removeUserFromOrgStub.throws()

    findActiveLeadMembershipsStub.reset()
    findActiveLeadMembershipsStub.resolves([])
  })

  function getInstance(): RemoveAdminMembershipFacade {
    return new RemoveAdminMembershipFacade(
      em,
      adminMembershipService,
      spaceService,
      spaceMembershipService,
      adminClient,
    )
  }

  function makeMembership(dxuser: string, role: ADMIN_GROUP_ROLES): AdminMembership {
    return {
      id: 1,
      user: { load: stub().resolves({ id: 10, dxuser }) },
      adminGroup: { load: stub().resolves({ role }) },
    } as unknown as AdminMembership
  }

  describe('#removeMembership', () => {
    it('throws InvalidStateError when membership is not found', async () => {
      findMembershipStub.withArgs(42).resolves(null)

      const facade = getInstance()
      await expect(facade.removeMembership(42)).to.be.rejectedWith(
        InvalidStateError,
        'Admin membership was not found - cannot be removed',
      )
    })

    it('throws PermissionError when removing site admin role from root admin user', async () => {
      const rootAdmin = config.platform.adminUser
      const membership = makeMembership(rootAdmin, ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(1).resolves(membership)

      const facade = getInstance()
      await expect(facade.removeMembership(1)).to.be.rejectedWith(
        PermissionError,
        'Cannot remove site admin role from the root admin user',
      )
    })

    it('throws InvalidStateError when user is lead in an admin space', async () => {
      const membership = makeMembership('site-admin-user', ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(99).resolves(membership)

      const adminSpace = { id: 200, name: 'Admin Space Alpha' }
      findActiveLeadMembershipsStub.resolves([{ spaces: { getItems: () => [adminSpace] } }])

      const facade = getInstance()
      await expect(facade.removeMembership(99)).to.be.rejectedWith(
        InvalidStateError,
        'Cannot remove site admin role: user is still a lead in admin space(s): Admin Space Alpha. Reassign the lead role first.',
      )
      expect(transactionalStub.callCount).to.equal(0)
    })

    it('proceeds with ROLE_SITE_ADMIN removal when user has no lead memberships in admin spaces', async () => {
      const membership = makeMembership('site-admin-user', ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(50).resolves(membership)

      // findActiveLeadMembershipsStub already returns [] by default from beforeEach
      findAdminSpacesStub.resolves([])
      removeUserFromOrgStub.resolves()

      const facade = getInstance()
      await facade.removeMembership(50)

      expect(removeRecordStub.calledOnce).to.be.true()
      expect(transactionalStub.calledOnce).to.be.true()
    })

    it('removes non-site-admin membership without org/space operations', async () => {
      const membership = makeMembership('regular-user', ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN)
      findMembershipStub.withArgs(5).resolves(membership)

      const facade = getInstance()
      await facade.removeMembership(5)

      expect(removeRecordStub.calledOnceWith(membership)).to.be.true()
      expect(removeUserFromOrgStub.callCount).to.equal(0)
      expect(deactivateAdminSpaceStub.callCount).to.equal(0)
    })

    it('removes ROLE_SITE_ADMIN membership with org and space deactivation', async () => {
      const membership = makeMembership('site-admin-user', ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(10).resolves(membership)

      const space1 = { id: 100, hostDxOrg: null }
      const space2 = { id: 101, hostDxOrg: null }
      findAdminSpacesStub.resolves([space1, space2])
      deactivateAdminSpaceStub.resolves(true)
      removeUserFromOrgStub.resolves()

      const facade = getInstance()
      await facade.removeMembership(10)

      expect(removeRecordStub.calledOnce).to.be.true()
      expect(removeUserFromOrgStub.calledOnce).to.be.true()
      expect(removeUserFromOrgStub.getCall(0).args[0]).to.deep.include({
        orgDxId: config.platform.pfdaAdminOrg,
      })
      expect(deactivateAdminSpaceStub.callCount).to.equal(2)
      expect(deactivateAdminSpaceStub.getCall(0).args).to.deep.equal([space1, { id: 10, dxuser: 'site-admin-user' }])
      expect(deactivateAdminSpaceStub.getCall(1).args).to.deep.equal([space2, { id: 10, dxuser: 'site-admin-user' }])
    })

    it('also removes user from space org when space has hostDxOrg and membership is found', async () => {
      const membership = makeMembership('space-org-user', ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(20).resolves(membership)

      const spaceWithOrg = { id: 200, hostDxOrg: 'org-SPACE-ORG-1' }
      findAdminSpacesStub.resolves([spaceWithOrg])
      deactivateAdminSpaceStub.resolves(true) // membership found
      removeUserFromOrgStub.resolves()

      const facade = getInstance()
      await facade.removeMembership(20)

      // Two calls: one for pfdaAdminOrg, one for the space org
      expect(removeUserFromOrgStub.callCount).to.equal(2)
      expect(removeUserFromOrgStub.getCall(0).args[0]).to.deep.include({
        orgDxId: config.platform.pfdaAdminOrg,
      })
      expect(removeUserFromOrgStub.getCall(1).args[0]).to.deep.include({
        orgDxId: spaceWithOrg.hostDxOrg,
      })
    })

    it('skips space org removal when space has hostDxOrg but membership is not found', async () => {
      const membership = makeMembership('no-space-membership-user', ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN)
      findMembershipStub.withArgs(30).resolves(membership)

      const spaceWithOrg = { id: 300, hostDxOrg: 'org-SPACE-ORG-2' }
      findAdminSpacesStub.resolves([spaceWithOrg])
      deactivateAdminSpaceStub.resolves(null) // membership NOT found
      removeUserFromOrgStub.resolves()

      const facade = getInstance()
      await facade.removeMembership(30)

      // Only one call: for pfdaAdminOrg; space org skipped because deactivate returned null
      expect(removeUserFromOrgStub.callCount).to.equal(1)
      expect(removeUserFromOrgStub.getCall(0).args[0]).to.deep.include({
        orgDxId: config.platform.pfdaAdminOrg,
      })
    })
  })
})
