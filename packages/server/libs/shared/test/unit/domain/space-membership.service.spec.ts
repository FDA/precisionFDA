import { Reference } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipPlatformAccessToAdminProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-admin.provider'
import { SpaceMembershipPlatformAccessToInactiveProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-inactive.provider'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceMembershipUpdatePermissionToAdminProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-admin.provider'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { InternalError, InvalidStateError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { OrgMemberAccess } from '@shared/platform-client/platform-client.params'
import { expect } from 'chai'
import { match, stub } from 'sinon'

describe('SpaceMembershipService', () => {
  const findChangeableMembershipsStub = stub()
  const bulkUpdateStub = stub()
  const validateUpdaterRoleStub = stub()
  const spaceMembershipUpdateRoleUpdateStub = stub()
  const nativeUpdateStub = stub()
  const orgSetMemberAccessStub = stub()
  const adminProjectDescribeStub = stub()
  const adminProjectUpdateStub = stub()
  const spaceMembershipFindStub = stub()
  const spaceMembershipFindOneStub = stub()
  const buildMembershipAccessPayloadStub = stub()

  const MEMBERSHIP_IDS = [1, 2, 3]
  const ORG_1 = 'org-1'
  const ORG_2 = 'org-2'
  const SPACE = {
    id: 4,
    type: SPACE_TYPE.GROUPS,
    getMembershipOrg: (_: SpaceMembership) => {
      return [ORG_1, ORG_2] as DxId<'org'>[]
    },
    hostProject: 'project-host' as DxId<'project'>,
    guestProject: 'project-guest' as DxId<'project'>,
  } as unknown as Space
  const CURRENT_MEMBERSHIP = {
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
  } as unknown as SpaceMembership
  const CURRENT_CONTRIBUTOR_MEMBERSHIP = {
    role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
  } as unknown as SpaceMembership
  const MEMBERSHIP_CONTRIBUTOR = {
    id: 4,
    user: {
      getEntity: (): User => ({ dxid: 'user-contributor' }) as unknown as User,
    } as unknown as Reference<User>,
    role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
    active: true,
  }
  const MEMBERSHIP_ADMIN = {
    id: 5,
    user: {
      getEntity: (): User => ({ dxid: 'user-admin' }) as unknown as User,
    } as unknown as Reference<User>,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
    active: true,
    spaces: {
      getItems: (): Space[] => [SPACE],
    },
  }
  const MEMBERSHIP_INACTIVE_ADMIN = {
    id: 6,
    user: {
      getEntity: (): User => ({ dxid: 'user-inactive.admin' }) as unknown as User,
    } as unknown as Reference<User>,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
    active: false,
    spaces: {
      getItems: (): Space[] => [SPACE],
    },
  }
  const MEMBERSHIP_INACTIVE_ADMIN_2 = {
    id: 7,
    user: {
      getEntity: (): User => ({ dxid: 'user-inactive.admin2' }) as unknown as User,
    } as unknown as Reference<User>,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
    active: false,
  }

  const userContext = {} as unknown as UserContext
  const platformClient = {
    orgSetMemberAccess: orgSetMemberAccessStub,
  } as unknown as PlatformClient
  const adminClient = {
    projectDescribe: adminProjectDescribeStub,
    projectUpdate: adminProjectUpdateStub,
  } as unknown as PlatformClient
  const spaceMembershipRepository = {
    findChangeableMemberships: findChangeableMembershipsStub,
    nativeUpdate: nativeUpdateStub,
    find: spaceMembershipFindStub,
    findOne: spaceMembershipFindOneStub,
  } as unknown as SpaceMembershipRepository
  const spaceMembershipPlatformAccessToInactiveProvider = {
    memberAccess: {
      level: 'MEMBER',
      allowBillableActivities: false,
      appAccess: false,
      projectAccess: 'NONE',
    } as OrgMemberAccess,
    bulkUpdate: bulkUpdateStub,
  } as unknown as SpaceMembershipPlatformAccessToInactiveProvider
  const spaceMembershipPlatformAccessToAdminProvider = {
    memberAccess: {
      level: 'ADMIN',
    },
  } as unknown as SpaceMembershipPlatformAccessToAdminProvider

  const spaceMembershipUpdateToAdminProvider = {
    validateUpdaterRole: validateUpdaterRoleStub,
    update: spaceMembershipUpdateRoleUpdateStub,
    updateMembership: (membership: SpaceMembership): void => {
      membership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
    },
    permittedUpdaterRoles: [SPACE_MEMBERSHIP_ROLE.ADMIN],
  } as unknown as SpaceMembershipUpdatePermissionToAdminProvider
  const spaceMembershipUpdatePermisisonProviderMap = {
    [SPACE_MEMBERSHIP_ROLE.ADMIN]: spaceMembershipUpdateToAdminProvider,
  } as unknown as {
    [T in SpaceMembershipPermission]: SpaceMembershipUpdatePermissionProvider
  }

  const spaceMembershipUpdatePermissionHelper = {
    buildMembershipAccessPayload: buildMembershipAccessPayloadStub,
  } as unknown as SpaceMembershipUpdatePermissionHelper

  beforeEach(() => {
    findChangeableMembershipsStub.reset()
    findChangeableMembershipsStub.throws()
    findChangeableMembershipsStub
      .withArgs(SPACE, MEMBERSHIP_IDS, match.bool, CURRENT_MEMBERSHIP)
      .resolves([])
      .withArgs(SPACE, [MEMBERSHIP_CONTRIBUTOR.id], true, CURRENT_MEMBERSHIP)
      .resolves([MEMBERSHIP_CONTRIBUTOR])
      .withArgs(SPACE, [MEMBERSHIP_ADMIN.id], true, CURRENT_MEMBERSHIP)
      .resolves([MEMBERSHIP_ADMIN])
      .withArgs(SPACE, [MEMBERSHIP_INACTIVE_ADMIN.id], false, CURRENT_MEMBERSHIP)
      .resolves([MEMBERSHIP_INACTIVE_ADMIN])
      .withArgs(
        SPACE,
        [MEMBERSHIP_INACTIVE_ADMIN.id, MEMBERSHIP_INACTIVE_ADMIN_2.id],
        false,
        CURRENT_MEMBERSHIP,
      )
      .returns([MEMBERSHIP_INACTIVE_ADMIN, MEMBERSHIP_INACTIVE_ADMIN_2])

    validateUpdaterRoleStub.reset()
    validateUpdaterRoleStub.throws()
    validateUpdaterRoleStub
      .withArgs(CURRENT_MEMBERSHIP)
      .resolves()
      .withArgs(CURRENT_CONTRIBUTOR_MEMBERSHIP)
      .throws(
        new PermissionError(
          'Current user does not have permission to update memberships to target role',
        ),
      )

    spaceMembershipUpdateRoleUpdateStub.reset()
    spaceMembershipUpdateRoleUpdateStub.throws()

    bulkUpdateStub.reset()
    bulkUpdateStub.throws()
    bulkUpdateStub.resolves()

    nativeUpdateStub.reset()
    nativeUpdateStub.throws()

    orgSetMemberAccessStub.reset()
    orgSetMemberAccessStub.throws()
    orgSetMemberAccessStub.resolves()

    adminProjectDescribeStub.reset()
    adminProjectDescribeStub.throws()

    adminProjectUpdateStub.reset()
    adminProjectUpdateStub.throws()

    spaceMembershipFindStub.reset()
    spaceMembershipFindStub.throws()

    spaceMembershipFindOneStub.reset()
    spaceMembershipFindOneStub.throws()

    buildMembershipAccessPayloadStub.reset()
    buildMembershipAccessPayloadStub.throws()
    buildMembershipAccessPayloadStub
      .withArgs([MEMBERSHIP_ADMIN, MEMBERSHIP_INACTIVE_ADMIN])
      .returns({
        'user-admin': spaceMembershipPlatformAccessToAdminProvider.memberAccess,
        'user-inactive.admin': spaceMembershipPlatformAccessToInactiveProvider.memberAccess,
      })
  })

  context('updateRole', () => {
    it('should throw error if validateUpdaterRole throws', async () => {
      const membershipIds = [MEMBERSHIP_CONTRIBUTOR.id]
      const targetRole = SPACE_MEMBERSHIP_ROLE.ADMIN

      const service = getInstance()
      await expect(
        service.updatePermission(SPACE, CURRENT_CONTRIBUTOR_MEMBERSHIP, membershipIds, targetRole),
      ).to.be.rejectedWith(
        PermissionError,
        'Current user does not have permission to update memberships to target role',
      )
      expect(validateUpdaterRoleStub.calledOnce).to.be.true()
      expect(validateUpdaterRoleStub.firstCall.args).to.deep.equal([CURRENT_CONTRIBUTOR_MEMBERSHIP])
    })

    it('should throw InvalidStateError if no memberships can be changed', async () => {
      const membershipIds = MEMBERSHIP_IDS
      const targetRole = SPACE_MEMBERSHIP_ROLE.ADMIN

      const service = getInstance()
      await expect(
        service.updatePermission(SPACE, CURRENT_MEMBERSHIP, membershipIds, targetRole),
      ).to.be.rejectedWith(InvalidStateError, 'No memberships can be changed')
      expect(validateUpdaterRoleStub.calledOnce).to.be.true()
      expect(validateUpdaterRoleStub.firstCall.args).to.deep.equal([CURRENT_MEMBERSHIP])
      expect(findChangeableMembershipsStub.calledOnce).to.be.true()
      expect(findChangeableMembershipsStub.firstCall.args).to.deep.equal([
        SPACE,
        membershipIds,
        true,
        CURRENT_MEMBERSHIP,
      ])
    })

    it('should throw error if update throws', async () => {
      const error = new InternalError('Not all records were updated')
      const membershipIds = [MEMBERSHIP_CONTRIBUTOR.id]
      const targetRole = SPACE_MEMBERSHIP_ROLE.ADMIN

      const changeableMemberships = [MEMBERSHIP_CONTRIBUTOR]
      spaceMembershipUpdateRoleUpdateStub.throws(error)

      const service = getInstance()
      await expect(
        service.updatePermission(SPACE, CURRENT_MEMBERSHIP, membershipIds, targetRole),
      ).to.be.rejectedWith(error)
      expect(validateUpdaterRoleStub.calledOnce).to.be.true()
      expect(validateUpdaterRoleStub.firstCall.args).to.deep.equal([CURRENT_MEMBERSHIP])
      expect(findChangeableMembershipsStub.calledOnce).to.be.true()
      expect(findChangeableMembershipsStub.firstCall.args).to.deep.equal([
        SPACE,
        membershipIds,
        true,
        CURRENT_MEMBERSHIP,
      ])
      expect(spaceMembershipUpdateRoleUpdateStub.calledOnce).to.be.true()
      expect(spaceMembershipUpdateRoleUpdateStub.firstCall.args).to.deep.equal([
        SPACE,
        CURRENT_MEMBERSHIP,
        changeableMemberships,
      ])
    })

    it('should return the changeable memberships', async () => {
      const changeableMemberships = [MEMBERSHIP_CONTRIBUTOR]
      spaceMembershipUpdateRoleUpdateStub.resolves()
      const membershipIds = [MEMBERSHIP_CONTRIBUTOR.id]
      const targetRole = SPACE_MEMBERSHIP_ROLE.ADMIN

      const service = getInstance()
      const result = await service.updatePermission(
        SPACE,
        CURRENT_MEMBERSHIP,
        membershipIds,
        targetRole,
      )
      expect(result).to.deep.equal(changeableMemberships)
      expect(validateUpdaterRoleStub.calledOnce).to.be.true()
      expect(validateUpdaterRoleStub.firstCall.args).to.deep.equal([CURRENT_MEMBERSHIP])
      expect(findChangeableMembershipsStub.calledOnce).to.be.true()
      expect(findChangeableMembershipsStub.firstCall.args).to.deep.equal([
        SPACE,
        membershipIds,
        true,
        CURRENT_MEMBERSHIP,
      ])
      expect(spaceMembershipUpdateRoleUpdateStub.calledOnce).to.be.true()
      expect(spaceMembershipUpdateRoleUpdateStub.firstCall.args).to.deep.equal([
        SPACE,
        CURRENT_MEMBERSHIP,
        changeableMemberships,
      ])
    })
  })

  context('syncPlatformAccess', () => {
    it('should return early if no memberships found', async () => {
      const memberIds = MEMBERSHIP_IDS
      const spaceId = SPACE.id
      spaceMembershipFindStub.resolves([])

      const service = getInstance()
      await service.syncPlatformAccess(spaceId, memberIds)
      expect(spaceMembershipFindStub.calledOnce).to.be.true()
      expect(spaceMembershipFindStub.firstCall.args).to.deep.equal([
        {
          spaces: { id: spaceId, state: SPACE_STATE.ACTIVE },
          id: { $in: memberIds },
        },
        { populate: ['user', 'spaces'] },
      ])
    })

    it('should call orgSetMemberAccess and update memberships', async () => {
      const changeableMemberships = [MEMBERSHIP_ADMIN, MEMBERSHIP_INACTIVE_ADMIN]
      const memberIds = [MEMBERSHIP_ADMIN.id, MEMBERSHIP_INACTIVE_ADMIN.id]
      const spaceId = SPACE.id
      spaceMembershipFindStub.resolves(changeableMemberships)
      const userDxId1 = MEMBERSHIP_ADMIN.user.getEntity().dxid
      const userDxId2 = MEMBERSHIP_INACTIVE_ADMIN.user.getEntity().dxid
      const adminAccess = spaceMembershipPlatformAccessToAdminProvider.memberAccess
      const inactiveAccess = spaceMembershipPlatformAccessToInactiveProvider.memberAccess
      const memberAccessPayload = {
        [userDxId1]: adminAccess,
        [userDxId2]: inactiveAccess,
      }
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: ORG_1,
          data: memberAccessPayload,
        })
        .resolves({ id: ORG_1 })
      orgSetMemberAccessStub
        .withArgs({
          orgDxId: ORG_2,
          data: memberAccessPayload,
        })
        .resolves({ id: ORG_2 })

      const service = getInstance()
      const result = await service.syncPlatformAccess(spaceId, memberIds)
      expect(result).to.deep.equal(undefined)
      expect(spaceMembershipFindStub.calledOnce).to.be.true()
      expect(spaceMembershipFindStub.firstCall.args).to.deep.equal([
        {
          id: { $in: memberIds },
          spaces: {
            state: SPACE_STATE.ACTIVE,
            id: spaceId,
          },
        },
        { populate: ['user', 'spaces'] },
      ])
      expect(orgSetMemberAccessStub.calledTwice).to.be.true()
      expect(orgSetMemberAccessStub.firstCall.args).to.deep.equal([
        {
          orgDxId: ORG_1,
          data: memberAccessPayload,
        },
      ])
      expect(orgSetMemberAccessStub.secondCall.args).to.deep.equal([
        {
          orgDxId: ORG_2,
          data: memberAccessPayload,
        },
      ])
      expect(buildMembershipAccessPayloadStub.calledOnce).to.be.true()
      expect(buildMembershipAccessPayloadStub.firstCall.args).to.deep.equal([changeableMemberships])
    })
  })

  context('syncSpaceLeadBillTo', () => {
    const MEMBERSHIP_LEAD = {
      id: 8,
      user: {
        getEntity: (): User =>
          ({ dxid: 'user-lead', billTo: () => 'org-pfda..lead' }) as unknown as User,
      } as unknown as Reference<User>,
      spaces: {
        getItems: (): Space[] => [SPACE],
      },
      role: SPACE_MEMBERSHIP_ROLE.LEAD,
      active: true,
      isHost: (): boolean => true,
    }

    it('should throw InvalidStateError if membership not found', async () => {
      const membershipId = -1
      spaceMembershipFindOneStub.resolves(null)

      const service = getInstance()
      await expect(service.syncSpaceLeadBillTo(membershipId)).to.be.rejectedWith(
        InvalidStateError,
        'Lead membership not found',
      )
      expect(spaceMembershipFindOneStub.calledOnce).to.be.true()
      expect(spaceMembershipFindOneStub.firstCall.args).to.deep.equal([
        { id: membershipId, role: SPACE_MEMBERSHIP_ROLE.LEAD, active: true },
        { populate: ['spaces', 'spaces.confidentialSpaces', 'user', 'user.organization'] },
      ])
    })

    it('should not update billTo if project billTo matches user organization', async () => {
      const membershipId = MEMBERSHIP_LEAD.id
      spaceMembershipFindOneStub.resolves(MEMBERSHIP_LEAD)
      adminProjectDescribeStub.withArgs(SPACE.hostProject).resolves({ billTo: 'org-pfda..lead' })

      const service = getInstance()
      await service.syncSpaceLeadBillTo(membershipId)
      expect(spaceMembershipFindOneStub.calledOnce).to.be.true()
      expect(spaceMembershipFindOneStub.firstCall.args).to.deep.equal([
        { id: membershipId, role: SPACE_MEMBERSHIP_ROLE.LEAD, active: true },
        { populate: ['spaces', 'spaces.confidentialSpaces', 'user', 'user.organization'] },
      ])
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([SPACE.hostProject])
      expect(adminProjectUpdateStub.notCalled).to.be.true()
    })

    it('should update project billTo if it does not match user organization', async () => {
      const membershipId = MEMBERSHIP_LEAD.id
      spaceMembershipFindOneStub.resolves(MEMBERSHIP_LEAD)
      adminProjectDescribeStub.withArgs(SPACE.hostProject).resolves({ billTo: 'org-pfda..x' })
      adminProjectUpdateStub.withArgs(SPACE.hostProject, { billTo: 'org-pfda..lead' }).resolves()

      const service = getInstance()
      await service.syncSpaceLeadBillTo(membershipId)
      expect(spaceMembershipFindOneStub.calledOnce).to.be.true()
      expect(spaceMembershipFindOneStub.firstCall.args).to.deep.equal([
        { id: membershipId, role: SPACE_MEMBERSHIP_ROLE.LEAD, active: true },
        { populate: ['spaces', 'spaces.confidentialSpaces', 'user', 'user.organization'] },
      ])
      expect(adminProjectDescribeStub.calledOnce).to.be.true()
      expect(adminProjectDescribeStub.firstCall.args).to.deep.equal([SPACE.hostProject])
      expect(adminProjectUpdateStub.calledOnce).to.be.true()
      expect(adminProjectUpdateStub.firstCall.args).to.deep.equal([
        SPACE.hostProject,
        { billTo: 'org-pfda..lead' },
      ])
    })
  })

  function getInstance(): SpaceMembershipService {
    return new SpaceMembershipService(
      userContext,
      platformClient,
      adminClient,
      spaceMembershipRepository,
      spaceMembershipUpdatePermisisonProviderMap,
      spaceMembershipUpdatePermissionHelper,
    )
  }
})
