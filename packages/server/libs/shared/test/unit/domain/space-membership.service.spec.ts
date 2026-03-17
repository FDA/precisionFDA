import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { database } from '@shared/database'
import { SpaceMembershipPlatformAccessToAdminProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-admin.provider'
import { SpaceMembershipPlatformAccessToContributorProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-contributor.provider'
import { SpaceMembershipPlatformAccessToInactiveProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-inactive.provider'
import { SpaceMembershipPlatformAccessToViewerProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-viewer.provider'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SpaceMembershipCountFilterProvider } from '@shared/domain/space-membership/service/space-membership-count-filter.provider'
import { SpaceMembershipCountService } from '@shared/domain/space-membership/service/space-membership-count.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceMembershipUpdatePermissionToActiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-active.provider'
import { SpaceMembershipUpdatePermissionToAdminProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-admin.provider'
import { SpaceMembershipUpdatePermissionToContributorProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-contributor.provider'
import { SpaceMembershipUpdatePermissionToInactiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-inactive.provider'
import { SpaceMembershipUpdatePermissionToLeadProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-lead.provider'
import { SpaceMembershipUpdatePermissionToViewerProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-viewer.provider'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { ClientRequestError, InvalidStateError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { create, db } from '@shared/test'

describe('SpaceMembershipService', () => {
  let em: SqlEntityManager
  let spaceMembershipRepository: SpaceMembershipRepository
  let userContext: UserContext
  let spaceMembershipUpdatePermissionProviderMap: {
    [T in SpaceMembershipPermission]: SpaceMembershipUpdatePermissionProvider
  }
  let spaceMembershipToPlatformAccessProviderMap: {
    [T in SpaceMembershipPermission]: SpaceMembershipPlatformAccessProvider
  }
  let spaceMembershipCountService: SpaceMembershipCountService
  let spaceMembershipUpdatePermissionHelper: SpaceMembershipUpdatePermissionHelper
  let groupSpace: Space
  let hostLead: User
  let guestLead: User
  let hostLeadMembership: SpaceMembership
  let groupGuestLeadMembership: SpaceMembership
  let groupViewerMembership: SpaceMembership
  let groupContributorMembership: SpaceMembership

  const orgSetMemberAccessStub = stub()
  const adminProjectDescribeStub = stub()
  const adminProjectUpdateStub = stub()
  const orgDescribeStub = stub()
  const orgFindMembersStub = stub()
  const inviteUserToOrganizationStub = stub()
  const removeUserFromOrganizationStub = stub()

  const platformClient = {
    orgDescribe: orgDescribeStub,
    orgSetMemberAccess: orgSetMemberAccessStub,
  } as unknown as PlatformClient
  const adminClient = {
    orgSetMemberAccess: orgSetMemberAccessStub,
    orgFindMembers: orgFindMembersStub,
    inviteUserToOrganization: inviteUserToOrganizationStub,
    projectDescribe: adminProjectDescribeStub,
    projectUpdate: adminProjectUpdateStub,
    removeUserFromOrganization: removeUserFromOrganizationStub,
  } as unknown as PlatformClient

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as SqlEntityManager
    em.clear()

    spaceMembershipRepository = new SpaceMembershipRepository(em, SpaceMembership)
    hostLead = create.userHelper.create(em)
    await em.flush()
    userContext = {
      id: hostLead.id,
      dxuser: hostLead.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: (): Promise<User> => Promise.resolve(hostLead),
    }
    const adminAccesProvider = new SpaceMembershipPlatformAccessToAdminProvider(em, platformClient)
    const contributorAccessProvider = new SpaceMembershipPlatformAccessToContributorProvider(em, platformClient)
    const viewerAccessProvider = new SpaceMembershipPlatformAccessToViewerProvider(em, platformClient)
    const inactiveAccessProvider = new SpaceMembershipPlatformAccessToInactiveProvider(em, platformClient)
    spaceMembershipToPlatformAccessProviderMap = {
      [SPACE_MEMBERSHIP_ROLE.LEAD]: adminAccesProvider,
      [SPACE_MEMBERSHIP_ROLE.ADMIN]: adminAccesProvider,
      [SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]: contributorAccessProvider,
      [SPACE_MEMBERSHIP_ROLE.VIEWER]: viewerAccessProvider,
      ['disable']: inactiveAccessProvider,
      ['enable']: null,
    }
    spaceMembershipUpdatePermissionHelper = new SpaceMembershipUpdatePermissionHelper(
      spaceMembershipToPlatformAccessProviderMap,
    )
    const spaceMembershipUpdatePermissionToActiveProvider = new SpaceMembershipUpdatePermissionToActiveProvider(
      em,
      platformClient,
      spaceMembershipRepository,
      spaceMembershipUpdatePermissionHelper,
    )
    const spaceMembershipUpdatePermissionToInactiveProvider = new SpaceMembershipUpdatePermissionToInactiveProvider(
      em,
      platformClient,
      spaceMembershipRepository,
      inactiveAccessProvider,
    )
    const spaceMembershipUpdatePermissionToViewerProvider = new SpaceMembershipUpdatePermissionToViewerProvider(
      em,
      platformClient,
      spaceMembershipRepository,
      viewerAccessProvider,
    )
    const spaceMembershipUpdatePermissionToContributorProvider =
      new SpaceMembershipUpdatePermissionToContributorProvider(
        em,
        platformClient,
        spaceMembershipRepository,
        contributorAccessProvider,
      )
    const spaceMembershipUpdatePermissionToAdminProvider = new SpaceMembershipUpdatePermissionToAdminProvider(
      em,
      platformClient,
      spaceMembershipRepository,
      adminAccesProvider,
    )
    const spaceMembershipUpdatePermissionToLeadProvider = new SpaceMembershipUpdatePermissionToLeadProvider(
      em,
      platformClient,
      spaceMembershipRepository,
      adminAccesProvider,
      adminClient,
    )
    spaceMembershipUpdatePermissionProviderMap = {
      ['enable']: spaceMembershipUpdatePermissionToActiveProvider,
      ['disable']: spaceMembershipUpdatePermissionToInactiveProvider,
      [SPACE_MEMBERSHIP_ROLE.VIEWER]: spaceMembershipUpdatePermissionToViewerProvider,
      [SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]: spaceMembershipUpdatePermissionToContributorProvider,
      [SPACE_MEMBERSHIP_ROLE.ADMIN]: spaceMembershipUpdatePermissionToAdminProvider,
      [SPACE_MEMBERSHIP_ROLE.LEAD]: spaceMembershipUpdatePermissionToLeadProvider,
    }
    const spaceMembershipCountFilterProvider = new SpaceMembershipCountFilterProvider()
    spaceMembershipCountService = new SpaceMembershipCountService(em, spaceMembershipCountFilterProvider)

    groupSpace = create.spacesHelper.create(em, {
      type: SPACE_TYPE.GROUPS,
      state: SPACE_STATE.ACTIVE,
      hostProject: 'project-grouphost',
      guestProject: 'project-groupguest',
    })
    guestLead = create.userHelper.create(em)
    hostLeadMembership = create.spacesHelper.addMember(
      em,
      { user: hostLead, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    groupGuestLeadMembership = create.spacesHelper.addMember(
      em,
      { user: guestLead, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    groupViewerMembership = create.spacesHelper.addMember(
      em,
      { user: create.userHelper.create(em), space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    groupContributorMembership = create.spacesHelper.addMember(
      em,
      { user: create.userHelper.create(em), space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()

    orgSetMemberAccessStub.reset()
    orgSetMemberAccessStub.throws()
    orgSetMemberAccessStub.resolves()
    orgDescribeStub.reset()
    orgDescribeStub.throws()
    orgDescribeStub.resolves({ admins: [`user-${config.platform.adminUser}`] })
    orgFindMembersStub.reset()
    orgFindMembersStub.throws()
    orgFindMembersStub.resolves({
      results: [],
    })
    inviteUserToOrganizationStub.reset()
    inviteUserToOrganizationStub.throws()
    inviteUserToOrganizationStub.resolves()

    adminProjectDescribeStub.reset()
    adminProjectDescribeStub.throws()
    adminProjectDescribeStub.withArgs(groupSpace.hostProject).resolves({
      billTo: hostLeadMembership.user.getEntity().billTo(),
    })
    adminProjectDescribeStub.withArgs(groupSpace.guestProject).resolves({
      billTo: groupGuestLeadMembership.user.getEntity().billTo(),
    })

    adminProjectUpdateStub.reset()
    adminProjectUpdateStub.throws()
    adminProjectUpdateStub.resolves()

    removeUserFromOrganizationStub.reset()
    removeUserFromOrganizationStub.throws()
    removeUserFromOrganizationStub.resolves()
  })

  context('updatePermission', () => {
    it('should throw error if validateUpdaterRole throws', async () => {
      await expect(
        getInstance().updatePermission(
          groupSpace,
          groupViewerMembership,
          [hostLeadMembership.id, groupContributorMembership.id],
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        PermissionError,
        'Current user does not have permission to update memberships to target role',
      )
    })

    it('should throw InvalidStateError if no memberships can be changed', async () => {
      await expect(
        getInstance().updatePermission(groupSpace, hostLeadMembership, [-1, -2], SPACE_MEMBERSHIP_ROLE.ADMIN),
      ).to.be.rejectedWith(InvalidStateError, 'No memberships can be changed')
    })

    it('should return the changeable memberships', async () => {
      const result = await getInstance().updatePermission(
        groupSpace,
        hostLeadMembership,
        [groupViewerMembership.id, groupContributorMembership.id],
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      expect(result).to.deep.equal([groupViewerMembership, groupContributorMembership])
    })

    it('should skip org access update if updater does not have access to guest org in Group space', async () => {
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: groupSpace.guestDxOrg,
          data: {
            [groupViewerMembership.user.getEntity().dxid]:
              spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        })
        .throws(
          new ClientRequestError(
            `PermissionDenied (401): Administrator access to ${groupSpace.guestDxOrg} required to perform this operation`,
            { clientStatusCode: 401, clientResponse: '' },
          ),
        )

      const result = await getInstance().updatePermission(
        groupSpace,
        hostLeadMembership,
        [groupViewerMembership.id],
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      expect(result).to.deep.equal([groupViewerMembership])
    })

    it('should skip org access update if updater does not have access to host org in Group space', async () => {
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: groupSpace.hostDxOrg,
          data: {
            [groupViewerMembership.user.getEntity().dxid]:
              spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        })
        .throws(
          new ClientRequestError(
            `PermissionDenied (401): Administrator access to ${groupSpace.hostDxOrg} required to perform this operation`,
            { clientStatusCode: 401, clientResponse: '' },
          ),
        )

      const result = await getInstance().updatePermission(
        groupSpace,
        groupGuestLeadMembership,
        [groupViewerMembership.id],
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      expect(result).to.deep.equal([groupViewerMembership])
    })

    it('should throw error if org access update fails by other platform error', async () => {
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: groupSpace.hostDxOrg,
          data: {
            [groupViewerMembership.user.getEntity().dxid]:
              spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        })
        .throws(new ClientRequestError(`Some other platform error`, { clientStatusCode: 500, clientResponse: '' }))

      await expect(
        getInstance().updatePermission(
          groupSpace,
          groupGuestLeadMembership,
          [groupViewerMembership.id],
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(ClientRequestError, 'Some other platform error')
    })

    it('should throw error if org access update fails in non-Group space', async () => {
      const reviewSpace = create.spacesHelper.create(em, {
        type: SPACE_TYPE.REVIEW,
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-reviewhost',
        guestProject: 'project-reviewguest',
      })
      const spaceHostLead = create.spacesHelper.addMember(
        em,
        { user: hostLead, space: reviewSpace },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      const reviewSpaceMember = create.spacesHelper.addMember(
        em,
        { user: create.userHelper.create(em), space: reviewSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: reviewSpace.hostDxOrg,
          data: {
            [reviewSpaceMember.user.getEntity().dxid]:
              spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        })
        .throws(new ClientRequestError(`Some other platform error`, { clientStatusCode: 500, clientResponse: '' }))

      await expect(
        getInstance().updatePermission(reviewSpace, spaceHostLead, [reviewSpaceMember.id], SPACE_MEMBERSHIP_ROLE.ADMIN),
      ).to.be.rejectedWith(ClientRequestError, 'Some other platform error')
    })
  })

  context('changeLeadRole', () => {
    it('should throw InvalidStateError if the new lead is already the current lead', async () => {
      await expect(getInstance().changeLeadRole(groupSpace, hostLeadMembership, hostLead)).to.be.rejectedWith(
        InvalidStateError,
        'The new lead is already the current lead',
      )
    })

    it('should throw InvalidStateError if the new lead is already a lead in the space', async () => {
      await expect(getInstance().changeLeadRole(groupSpace, hostLeadMembership, guestLead)).to.be.rejectedWith(
        InvalidStateError,
        'The new lead is already a lead in the space',
      )
    })

    it('should update lead role if user is already a member', async () => {
      const newLeadMembership = create.spacesHelper.addMember(
        em,
        { user: create.userHelper.create(em), space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()
      orgFindMembersStub.resolves({
        results: [
          {
            id: newLeadMembership.user.getEntity().dxid,
          },
        ],
      })

      const result = await getInstance().changeLeadRole(
        groupSpace,
        hostLeadMembership,
        newLeadMembership.user.getEntity(),
      )
      expect(hostLeadMembership.role).to.equal(SPACE_MEMBERSHIP_ROLE.ADMIN)
      expect(result[0].id).to.equal(newLeadMembership.id)
      expect(result[0].role).to.equal(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result[0].side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(orgFindMembersStub.calledTwice).to.be.true()
      expect(orgFindMembersStub.firstCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.hostDxOrg,
          id: [newLeadMembership.user.getEntity().dxid],
        },
      ])
      expect(orgFindMembersStub.secondCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.guestDxOrg,
          id: [newLeadMembership.user.getEntity().dxid],
        },
      ])
      expect(inviteUserToOrganizationStub.notCalled).to.be.true()
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([groupSpace.hostProject])
      expect(adminProjectUpdateStub.calledOnce).to.be.true()
      expect(adminProjectUpdateStub.firstCall.args).to.deep.equal([
        groupSpace.hostProject,
        { billTo: newLeadMembership.user.getEntity().billTo() },
      ])
    })

    it('should invite user to orgs if user is not a member and update lead role', async () => {
      const newLeadMembership = create.spacesHelper.addMember(
        em,
        { user: create.userHelper.create(em), space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      const newUser = newLeadMembership.user.getEntity()
      const result = await getInstance().changeLeadRole(groupSpace, hostLeadMembership, newUser)
      expect(hostLeadMembership.role).to.equal(SPACE_MEMBERSHIP_ROLE.ADMIN)
      expect(result[0].role).to.equal(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result[0].side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(orgFindMembersStub.calledTwice).to.be.true()
      expect(orgFindMembersStub.firstCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.hostDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(orgFindMembersStub.secondCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.guestDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(inviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(inviteUserToOrganizationStub.firstCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.hostDxOrg,
          data: {
            invitee: newUser.dxid,
            suppressEmailNotification: true,
            ...spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        },
      ])
      expect(inviteUserToOrganizationStub.secondCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.guestDxOrg,
          data: {
            invitee: newUser.dxid,
            suppressEmailNotification: true,
            ...spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        },
      ])
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([groupSpace.hostProject])
      expect(adminProjectUpdateStub.calledOnce).to.be.true()
      expect(adminProjectUpdateStub.firstCall.args).to.deep.equal([
        groupSpace.hostProject,
        { billTo: newUser.billTo() },
      ])
    })

    it('should remove user from opposite if user is not longer a member on that side', async () => {
      const newUser = create.userHelper.create(em)
      const reviewSpace = create.spacesHelper.create(em, {
        type: SPACE_TYPE.REVIEW,
        state: SPACE_STATE.ACTIVE,
        hostProject: 'project-reviewhost',
        guestProject: 'project-reviewguest',
      })
      const cfHostSpace = create.spacesHelper.createConfidentialReview(em, reviewSpace, SPACE_MEMBERSHIP_SIDE.HOST)
      const cfGuestSpace = create.spacesHelper.createConfidentialReview(em, reviewSpace, SPACE_MEMBERSHIP_SIDE.GUEST)

      create.spacesHelper.addMember(
        em,
        { user: hostLead, space: reviewSpace },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space: cfHostSpace },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      const reviewSpaceGuestLead = create.spacesHelper.addMember(
        em,
        { user: guestLead, space: reviewSpace },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space: cfGuestSpace },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user: newUser, space: reviewSpace },
        { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: newUser, space: cfHostSpace },
        { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      orgFindMembersStub
        .withArgs({
          orgDxid: reviewSpace.hostDxOrg,
          id: [newUser.dxid],
        })
        .resolves({
          results: [
            {
              id: newUser.dxid,
              level: 'ADMIN',
            },
          ],
        })
      orgFindMembersStub
        .withArgs({
          orgDxid: reviewSpace.guestDxOrg,
          id: [newUser.dxid],
        })
        .resolves({
          results: [],
        })
      removeUserFromOrganizationStub
        .withArgs({
          orgDxId: reviewSpace.hostDxOrg,
          data: {
            user: newUser.dxid,
          },
        })
        .resolves({
          id: reviewSpace.hostDxOrg,
        })
      adminProjectDescribeStub
        .withArgs(reviewSpace.guestProject)
        .resolves({ billTo: reviewSpaceGuestLead.user.getEntity().billTo() })
        .withArgs(cfGuestSpace.guestProject)
        .resolves({ billTo: reviewSpaceGuestLead.user.getEntity().billTo() })

      const result = await getInstance().changeLeadRole(reviewSpace, reviewSpaceGuestLead, newUser)
      expect(reviewSpaceGuestLead.role).to.equal(SPACE_MEMBERSHIP_ROLE.ADMIN)
      expect(result[0].role).to.equal(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result[0].side).to.equal(SPACE_MEMBERSHIP_SIDE.GUEST)
      expect(orgFindMembersStub.calledTwice).to.be.true()
      expect(orgFindMembersStub.firstCall.args).to.deep.equal([
        {
          orgDxid: reviewSpace.guestDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(orgFindMembersStub.secondCall.args).to.deep.equal([
        {
          orgDxid: reviewSpace.hostDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(inviteUserToOrganizationStub.calledOnce).to.be.true()
      expect(inviteUserToOrganizationStub.firstCall.args).to.deep.equal([
        {
          orgDxId: reviewSpace.guestDxOrg,
          data: {
            invitee: newUser.dxid,
            suppressEmailNotification: true,
            ...spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        },
      ])
      expect(removeUserFromOrganizationStub.calledOnce).to.be.true()
      expect(removeUserFromOrganizationStub.firstCall.args).to.deep.equal([
        {
          orgDxId: reviewSpace.hostDxOrg,
          data: {
            user: newUser.dxid,
          },
        },
      ])
    })

    it('should create new membership if user is not a member and update lead role', async () => {
      const newUser = create.userHelper.create(em)
      await em.flush()

      const result = await getInstance().changeLeadRole(groupSpace, hostLeadMembership, newUser)
      expect(hostLeadMembership.role).to.equal(SPACE_MEMBERSHIP_ROLE.ADMIN)
      expect(result[0].role).to.equal(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result[0].side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(orgFindMembersStub.calledTwice).to.be.true()
      expect(orgFindMembersStub.firstCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.hostDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(orgFindMembersStub.secondCall.args).to.deep.equal([
        {
          orgDxid: groupSpace.guestDxOrg,
          id: [newUser.dxid],
        },
      ])
      expect(inviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(inviteUserToOrganizationStub.firstCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.hostDxOrg,
          data: {
            invitee: newUser.dxid,
            suppressEmailNotification: true,
            ...spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        },
      ])
      expect(inviteUserToOrganizationStub.secondCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.guestDxOrg,
          data: {
            invitee: newUser.dxid,
            suppressEmailNotification: true,
            ...spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
          },
        },
      ])
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([groupSpace.hostProject])
      expect(adminProjectUpdateStub.calledOnce).to.be.true()
      expect(adminProjectUpdateStub.firstCall.args).to.deep.equal([
        groupSpace.hostProject,
        { billTo: newUser.billTo() },
      ])
    })
  })

  context('syncPlatformAccess', () => {
    it('should return early if no memberships found', async () => {
      const result = await getInstance().syncPlatformAccess(groupSpace.id, [-1, -2])
      expect(orgSetMemberAccessStub.callCount).to.be.equal(0)
      expect(result).to.deep.equal(undefined)
    })

    it('should call orgSetMemberAccess and update memberships', async () => {
      const memberAccessPayload = {
        [groupViewerMembership.user.getEntity().dxid]:
          spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.VIEWER].memberAccess,
        [groupContributorMembership.user.getEntity().dxid]:
          spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR].memberAccess,
      }

      const result = await getInstance().syncPlatformAccess(groupSpace.id, [
        groupViewerMembership.id,
        groupContributorMembership.id,
      ])
      expect(result).to.deep.equal(undefined)
      expect(orgSetMemberAccessStub.calledTwice).to.be.true()
      expect(orgSetMemberAccessStub.firstCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.hostDxOrg,
          data: memberAccessPayload,
        },
      ])
      expect(orgSetMemberAccessStub.secondCall.args).to.deep.equal([
        {
          orgDxId: groupSpace.guestDxOrg,
          data: memberAccessPayload,
        },
      ])
    })
  })

  context('syncSpaceLeadBillTo', () => {
    it('should throw InvalidStateError if membership not found', async () => {
      const membershipId = -1

      const service = getInstance()
      await expect(service.syncSpaceLeadBillTo(membershipId)).to.be.rejectedWith(
        InvalidStateError,
        'Lead membership not found',
      )
    })

    it('should not update billTo if project billTo matches user organization', async () => {
      adminProjectDescribeStub.withArgs(groupSpace.hostProject).resolves({ billTo: hostLead.billTo() })

      await getInstance().syncSpaceLeadBillTo(hostLeadMembership.id)
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([groupSpace.hostProject])
      expect(adminProjectUpdateStub.notCalled).to.be.true()
    })

    it('should update project billTo if it does not match user organization', async () => {
      adminProjectDescribeStub.withArgs(groupSpace.hostProject).resolves({ billTo: 'org-pfda..x' })

      await getInstance().syncSpaceLeadBillTo(hostLeadMembership.id)
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([groupSpace.hostProject])
      expect(adminProjectUpdateStub.calledOnce).to.be.true()
      expect(adminProjectUpdateStub.firstCall.args).to.deep.equal([
        groupSpace.hostProject,
        { billTo: hostLead.billTo() },
      ])
    })
  })

  function getInstance(): SpaceMembershipService {
    return new SpaceMembershipService(
      em,
      userContext,
      platformClient,
      adminClient,
      spaceMembershipRepository,
      spaceMembershipUpdatePermissionProviderMap,
      spaceMembershipUpdatePermissionHelper,
      spaceMembershipToPlatformAccessProviderMap,
      spaceMembershipCountService,
    )
  }
})
