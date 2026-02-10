import { Reference, SqlEntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserService } from '@shared/domain/user/service/user.service'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError } from '@shared/errors'
import { SpaceMembershipUpdateFacade } from '@shared/facade/space-membership/space-membership-update.facade'
import { PlatformClient } from '@shared/platform-client'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceMembershipUpdateFacade', () => {
  let referenceStub: sinon.SinonStub
  const getCurrentUserMembershipInSharedSpaceStub = stub()
  const populateStub = stub()
  const transactionalStub = stub()
  const persistStub = stub()
  const flushStub = stub()
  const sendEmailStub = stub()
  const getSharedSpaceStub = stub()
  const getMembershipInSpaceStub = stub()
  const findEditableByIdStub = stub()
  const changeLeadRoleStub = stub()

  const updatePermissionStub = stub()

  const createSyncSpaceMemberAccessTaskStub = stub()
  const createSyncSpaceLeadBillToTaskStub = stub()

  const getUserByDxuserStub = stub()

  const orgDescribeStub = stub()

  const GROUP_SPACE_ID = 4
  const MEMBER_IDS = [2, 3]
  const CURRENT_MEMBERSHIP_ID = 4

  const currentUser = { id: 1 } as unknown as User
  const userContext = {
    loadEntity: () => Promise.resolve(currentUser),
  } as UserContext
  const space = {
    id: GROUP_SPACE_ID,
    hostDxOrg: 'org-pfda..host',
    guestDxOrg: 'org-pfda..guest',
    getMembershipOrg: (_: SpaceMembership) => ['org-pfda..host', 'org-pfda..guest'],
  } as unknown as Space
  const membership = {
    id: CURRENT_MEMBERSHIP_ID,
    role: SPACE_MEMBERSHIP_ROLE.LEAD,
    side: SPACE_MEMBERSHIP_SIDE.HOST,
    active: true,
    spaces: {
      getItems: () => [space],
    },
    user: {
      getEntity: (): User =>
        ({ id: 9, fullName: 'Lead User', billTo: () => 'org-pfda..lead.user' }) as unknown as User,
    },
  } as unknown as SpaceMembership

  const changeableMemberships = [
    {
      id: MEMBER_IDS[0],
      role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      side: SPACE_MEMBERSHIP_SIDE.HOST,
      spaces: {
        getItems: (): Space[] => [space],
      },
      user: {
        getEntity: (): User => ({ id: 10, fullName: 'User 10' }) as User,
      },
    },
    {
      id: MEMBER_IDS[1],
      role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      side: SPACE_MEMBERSHIP_SIDE.GUEST,
      spaces: {
        getItems: (): Space[] => [space],
      },
      user: {
        getEntity: (): User => ({ id: 11, fullName: 'User 11' }) as User,
      },
    },
  ] as unknown as SpaceMembership[]
  const spaceAdmin = {
    id: 5,
    role: SPACE_MEMBERSHIP_ROLE.ADMIN,
    side: SPACE_MEMBERSHIP_SIDE.HOST,
    spaces: { getItems: () => [space] },
    user: { getEntity: () => ({ id: 12, fullName: 'Lead User' }) as User },
  } as unknown as SpaceMembership

  const em = {
    populate: populateStub,
    transactional: transactionalStub,
    persist: persistStub,
    flush: flushStub,
  } as unknown as SqlEntityManager
  const platformClient = {
    orgDescribe: orgDescribeStub,
  } as unknown as PlatformClient
  const spaceService = {
    getSharedSpace: getSharedSpaceStub,
    findEditableById: findEditableByIdStub,
  } as unknown as SpaceService
  const spaceMembershipService = {
    getCurrentUserMembershipInSharedSpace: getCurrentUserMembershipInSharedSpaceStub,
    updatePermission: updatePermissionStub,
    getMembershipInSpace: getMembershipInSpaceStub,
    changeLeadRole: changeLeadRoleStub,
  } as unknown as SpaceMembershipService
  const userService = {
    getUserByDxuser: getUserByDxuserStub,
  } as unknown as UserService
  const maintenanceQueueJobProducer = {
    createSyncSpaceMemberAccessTask: createSyncSpaceMemberAccessTaskStub,
    createSyncSpaceLeadBillToTask: createSyncSpaceLeadBillToTaskStub,
  } as unknown as MaintenanceQueueJobProducer
  const emailService = {
    sendEmail: sendEmailStub,
  } as unknown as EmailService

  beforeEach(() => {
    getSharedSpaceStub.reset()
    getSharedSpaceStub.throws()
    getSharedSpaceStub.withArgs(GROUP_SPACE_ID).resolves(space)
    findEditableByIdStub.reset()
    findEditableByIdStub.throws()
    findEditableByIdStub.resolves(null).withArgs(GROUP_SPACE_ID).resolves(space)

    getCurrentUserMembershipInSharedSpaceStub.reset()
    getCurrentUserMembershipInSharedSpaceStub.throws()
    getCurrentUserMembershipInSharedSpaceStub.withArgs(GROUP_SPACE_ID).resolves(membership)
    populateStub.reset()
    populateStub.throws()
    populateStub.resolves()
    transactionalStub.reset()
    transactionalStub.callsFake(async (callback) => {
      return await callback(em)
    })
    persistStub.reset()
    persistStub.throws()
    persistStub.resolves()
    flushStub.reset()
    flushStub.throws()
    flushStub.resolves()

    updatePermissionStub.reset()
    updatePermissionStub.throws()
    getMembershipInSpaceStub.reset()
    getMembershipInSpaceStub.throws()
    getMembershipInSpaceStub
      .resolves(null)
      .withArgs(GROUP_SPACE_ID, membership.id)
      .resolves(membership)
      .withArgs(GROUP_SPACE_ID, spaceAdmin.id)
      .resolves(spaceAdmin)

    changeLeadRoleStub.reset()
    changeLeadRoleStub.throws()

    createSyncSpaceMemberAccessTaskStub.reset()
    createSyncSpaceMemberAccessTaskStub.throws()
    createSyncSpaceMemberAccessTaskStub.resolves()

    getUserByDxuserStub.reset()
    getUserByDxuserStub.throws()
    getUserByDxuserStub.resolves(null)

    orgDescribeStub.reset()
    orgDescribeStub.throws()
    orgDescribeStub.resolves({
      admins: [`user-${config.platform.adminUser}`],
    })

    sendEmailStub.reset()
    sendEmailStub.throws()
    sendEmailStub.resolves()
    referenceStub = stub(Reference, 'create')
    referenceStub.withArgs(space).returns(space as unknown as Reference<Space>)
    referenceStub.withArgs(currentUser).returns(currentUser as unknown as Reference<User>)

    createSyncSpaceLeadBillToTaskStub.reset()
    createSyncSpaceLeadBillToTaskStub.throws()
    createSyncSpaceLeadBillToTaskStub.resolves()
  })

  afterEach(() => {
    referenceStub.restore()
  })

  context('updatePermissions', () => {
    it('should throw if no valid action provided', async () => {
      const facade = getInstance()
      await expect(
        facade.updatePermissions(GROUP_SPACE_ID, {
          membershipIds: MEMBER_IDS,
        }),
      ).to.be.rejectedWith(InvalidStateError, 'No valid update action provided')
    })

    it('should call updateState if enabled provided', async () => {
      const updateStateStub = stub(SpaceMembershipUpdateFacade.prototype, 'updateState')
      updateStateStub.resolves([])
      const facade = getInstance()
      const result = await facade.updatePermissions(GROUP_SPACE_ID, {
        membershipIds: MEMBER_IDS,
        enabled: true,
      })
      expect(result).to.deep.equal([])
      expect(updateStateStub.calledOnce).to.be.true()
      expect(updateStateStub.firstCall.args).to.deep.equal([space, MEMBER_IDS, true])
      updateStateStub.restore()
    })

    it('should call updateRole if targetRole provided', async () => {
      const updateRoleStub = stub(SpaceMembershipUpdateFacade.prototype, 'updateRole')
      updateRoleStub.resolves([])
      const facade = getInstance()
      const result = await facade.updatePermissions(GROUP_SPACE_ID, {
        membershipIds: MEMBER_IDS,
        targetRole: SPACE_MEMBERSHIP_ROLE.VIEWER,
      })
      expect(result).to.deep.equal([])
      expect(updateRoleStub.calledOnce).to.be.true()
      expect(updateRoleStub.firstCall.args).to.deep.equal([
        space,
        MEMBER_IDS,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      ])
      updateRoleStub.restore()
    })
  })

  context('updateState', () => {
    it('should throw if current user is not a member of the space', async () => {
      getCurrentUserMembershipInSharedSpaceStub.reset()
      getCurrentUserMembershipInSharedSpaceStub.resolves(null)

      const facade = getInstance()
      await expect(facade.updateState(space, MEMBER_IDS, true)).to.be.rejectedWith(
        InvalidStateError,
        'Current user is not a member of the space or invalid space',
      )
      expect(getCurrentUserMembershipInSharedSpaceStub.calledOnce).to.be.true()
      expect(getCurrentUserMembershipInSharedSpaceStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
      ])
    })

    it('should deactivate memberships if enabled is false', async () => {
      updatePermissionStub.resolves(changeableMemberships)

      const facade = getInstance()
      await facade.updateState(space, MEMBER_IDS, false)
      expect(getCurrentUserMembershipInSharedSpaceStub.calledOnce).to.be.true()
      expect(getCurrentUserMembershipInSharedSpaceStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
      ])
      expect(transactionalStub.calledOnce).to.be.true()
      expect(populateStub.callCount).to.equal(1)
      expect(populateStub.firstCall.args).to.deep.equal([changeableMemberships, ['spaces']])
      expect(updatePermissionStub.calledOnce).to.be.true()
      expect(persistStub.callCount).to.equal(2)
      expect(persistStub.firstCall.args[0].entityId).to.equal(changeableMemberships[0].id)
      expect(persistStub.firstCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
      )
      expect(persistStub.firstCall.args[0].role).to.equal(changeableMemberships[0].role)
      expect(persistStub.firstCall.args[0].side).to.equal(changeableMemberships[0].side)
      expect(persistStub.firstCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'disable',
          full_name: changeableMemberships[0].user.getEntity().fullName,
        }),
      )
      expect(persistStub.secondCall.args[0].entityId).to.equal(changeableMemberships[1].id)
      expect(persistStub.secondCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.secondCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_disabled,
      )
      expect(persistStub.secondCall.args[0].role).to.equal(changeableMemberships[1].role)
      expect(persistStub.secondCall.args[0].side).to.equal(changeableMemberships[1].side)
      expect(persistStub.secondCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'disable',
          full_name: changeableMemberships[1].user.getEntity().fullName,
        }),
      )
      expect(flushStub.calledOnce).to.be.true()
      expect(sendEmailStub.callCount).to.equal(2)
      expect(sendEmailStub.firstCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[0],
          activityType: 'membership_disabled',
          newMembershipRole: 'disable',
        },
      })
      expect(sendEmailStub.secondCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[1],
          activityType: 'membership_disabled',
          newMembershipRole: 'disable',
        },
      })
    })

    it('should activate memberships if enabled is true', async () => {
      updatePermissionStub.resolves(changeableMemberships)

      const facade = getInstance()
      await facade.updateState(space, MEMBER_IDS, true)
      expect(getCurrentUserMembershipInSharedSpaceStub.calledOnce).to.be.true()
      expect(getCurrentUserMembershipInSharedSpaceStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
      ])
      expect(transactionalStub.calledOnce).to.be.true()
      expect(populateStub.callCount).to.equal(1)
      expect(populateStub.firstCall.args).to.deep.equal([changeableMemberships, ['spaces']])
      expect(updatePermissionStub.calledOnce).to.be.true()
      expect(persistStub.callCount).to.equal(2)
      expect(persistStub.firstCall.args[0].entityId).to.equal(changeableMemberships[0].id)
      expect(persistStub.firstCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
      )
      expect(persistStub.firstCall.args[0].role).to.equal(changeableMemberships[0].role)
      expect(persistStub.firstCall.args[0].side).to.equal(changeableMemberships[0].side)
      expect(persistStub.firstCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'enable',
          full_name: changeableMemberships[0].user.getEntity().fullName,
        }),
      )
      expect(persistStub.secondCall.args[0].entityId).to.equal(changeableMemberships[1].id)
      expect(persistStub.secondCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.secondCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_enabled,
      )
      expect(persistStub.secondCall.args[0].role).to.equal(changeableMemberships[1].role)
      expect(persistStub.secondCall.args[0].side).to.equal(changeableMemberships[1].side)
      expect(persistStub.secondCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'enable',
          full_name: changeableMemberships[1].user.getEntity().fullName,
        }),
      )
      expect(flushStub.calledOnce).to.be.true()
      expect(sendEmailStub.callCount).to.equal(2)
      expect(sendEmailStub.firstCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[0],
          activityType: 'membership_enabled',
          newMembershipRole: 'enable',
        },
      })
      expect(sendEmailStub.secondCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[1],
          activityType: 'membership_enabled',
          newMembershipRole: 'enable',
        },
      })
    })

    it('should rollback platform changes if update failed', async () => {
      updatePermissionStub.resolves(changeableMemberships)
      flushStub.rejects(new Error('Test error'))

      const facade = getInstance()
      await expect(facade.updateState(space, MEMBER_IDS, false)).to.be.rejectedWith(
        Error,
        'Test error',
      )
      expect(createSyncSpaceMemberAccessTaskStub.calledOnce).to.be.true()
      expect(createSyncSpaceMemberAccessTaskStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
        MEMBER_IDS,
      ])
    })
  })

  context('updateRole', () => {
    it('should throw if current user is not a member of the space', async () => {
      getCurrentUserMembershipInSharedSpaceStub.reset()
      getCurrentUserMembershipInSharedSpaceStub.resolves(null)

      const facade = getInstance()
      await expect(
        facade.updateRole(space, MEMBER_IDS, SPACE_MEMBERSHIP_ROLE.VIEWER),
      ).to.be.rejectedWith(
        InvalidStateError,
        'Current user is not a member of the space or invalid space',
      )
      expect(getCurrentUserMembershipInSharedSpaceStub.calledOnce).to.be.true()
      expect(getCurrentUserMembershipInSharedSpaceStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
      ])
    })

    it('should update role for memberships', async () => {
      updatePermissionStub.resolves(changeableMemberships)
      const facade = getInstance()
      await facade.updateRole(space, MEMBER_IDS, SPACE_MEMBERSHIP_ROLE.VIEWER)
      expect(getCurrentUserMembershipInSharedSpaceStub.calledOnce).to.be.true()
      expect(getCurrentUserMembershipInSharedSpaceStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
      ])
      expect(transactionalStub.calledOnce).to.be.true()
      expect(populateStub.callCount).to.equal(1)
      expect(populateStub.firstCall.args).to.deep.equal([changeableMemberships, ['spaces']])
      expect(updatePermissionStub.calledOnce).to.be.true()
      expect(updatePermissionStub.firstCall.args).to.deep.equal([
        space,
        membership,
        MEMBER_IDS,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      ])
      expect(persistStub.callCount).to.equal(2)
      expect(persistStub.firstCall.args[0].entityId).to.equal(changeableMemberships[0].id)
      expect(persistStub.firstCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      )
      expect(persistStub.firstCall.args[0].role).to.equal(changeableMemberships[0].role)
      expect(persistStub.firstCall.args[0].side).to.equal(changeableMemberships[0].side)
      expect(persistStub.firstCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'viewer',
          full_name: changeableMemberships[0].user.getEntity().fullName,
        }),
      )
      expect(persistStub.secondCall.args[0].entityId).to.equal(changeableMemberships[1].id)
      expect(persistStub.secondCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.secondCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      )
      expect(persistStub.secondCall.args[0].role).to.equal(changeableMemberships[1].role)
      expect(persistStub.secondCall.args[0].side).to.equal(changeableMemberships[1].side)
      expect(persistStub.secondCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'viewer',
          full_name: changeableMemberships[1].user.getEntity().fullName,
        }),
      )
      expect(flushStub.callCount).to.equal(1)
      expect(sendEmailStub.callCount).to.equal(2)
      expect(sendEmailStub.firstCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[0],
          activityType: 'membership_changed',
          newMembershipRole: 'VIEWER',
        },
      })
      expect(sendEmailStub.secondCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: MEMBER_IDS[1],
          activityType: 'membership_changed',
          newMembershipRole: 'VIEWER',
        },
      })
    })

    it('should rollback platform changes if update failed', async () => {
      updatePermissionStub.resolves(changeableMemberships)
      flushStub.rejects(new Error('Test error'))

      const facade = getInstance()
      await expect(
        facade.updateRole(space, MEMBER_IDS, SPACE_MEMBERSHIP_ROLE.VIEWER),
      ).to.be.rejectedWith(Error, 'Test error')
      expect(createSyncSpaceMemberAccessTaskStub.calledOnce).to.be.true()
      expect(createSyncSpaceMemberAccessTaskStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
        MEMBER_IDS,
      ])
    })

    it('should rollback billTo changes if update failed', async () => {
      updatePermissionStub.resolves(changeableMemberships)
      flushStub.rejects(new Error('Test error'))

      const facade = getInstance()
      await expect(
        facade.updateRole(space, [MEMBER_IDS[0]], SPACE_MEMBERSHIP_ROLE.LEAD),
      ).to.be.rejectedWith(Error, 'Test error')
      expect(createSyncSpaceMemberAccessTaskStub.calledOnce).to.be.true()
      expect(createSyncSpaceMemberAccessTaskStub.firstCall.args).to.deep.equal([
        GROUP_SPACE_ID,
        [MEMBER_IDS[0]],
      ])
      expect(createSyncSpaceLeadBillToTaskStub.calledOnce).to.be.true()
      expect(createSyncSpaceLeadBillToTaskStub.firstCall.args).to.deep.equal([membership.id])
    })
  })

  context('recoverSpaceLead', () => {
    const NEW_LEAD_DXUSER = 'new.user'
    const NEW_LEAD_USER = {
      id: 10,
      fullName: 'New Lead User',
      dxuser: NEW_LEAD_DXUSER,
      dxid: `user-${NEW_LEAD_DXUSER}`,
      billTo: () => 'org-pfda..new.user',
    } as unknown as User
    const newLeadMembership = {
      id: 20,
      role: SPACE_MEMBERSHIP_ROLE.LEAD,
      side: SPACE_MEMBERSHIP_SIDE.HOST,
      spaces: {
        getItems: (): Space[] => [space],
      },
      user: {
        getEntity: (): User => NEW_LEAD_USER,
      },
    } as unknown as SpaceMembership

    beforeEach(() => {
      getUserByDxuserStub.withArgs(NEW_LEAD_DXUSER).resolves(NEW_LEAD_USER)
    })

    it('should throw if new lead user not found', async () => {
      const newLeadDxuser = 'new_lead_user'
      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, CURRENT_MEMBERSHIP_ID, newLeadDxuser),
      ).to.be.rejectedWith(InvalidStateError, `User ${newLeadDxuser} not found`)
    })

    it('should throw if space not found', async () => {
      const invalidSpaceId = 9999
      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(invalidSpaceId, CURRENT_MEMBERSHIP_ID, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(InvalidStateError, `Shared space with id ${invalidSpaceId} not found`)
    })

    it('should throw if current lead membership not found', async () => {
      const invalidMembershipId = 9999
      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, invalidMembershipId, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(InvalidStateError, 'Current lead not found')
    })

    it('should throw if current member is not a lead in the space', async () => {
      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, spaceAdmin.id, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(InvalidStateError, 'Current member is not a lead in the space')
    })

    it('should throw if current lead is not active', async () => {
      const inactiveLeadMembership = {
        id: 123,
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        active: false,
        spaces: {
          getItems: (): Space[] => [space],
        },
      } as unknown as SpaceMembership
      getMembershipInSpaceStub
        .withArgs(GROUP_SPACE_ID, inactiveLeadMembership.id)
        .resolves(inactiveLeadMembership)

      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, inactiveLeadMembership.id, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(InvalidStateError, 'Current lead is not active')
    })

    it('should throw if admin user does not exist in the orgs', async () => {
      orgDescribeStub
        .withArgs({
          dxid: space.guestDxOrg,
          defaultFields: false,
          fields: {
            admins: true,
          },
        })
        .resolves({
          admins: [],
        })
      orgDescribeStub
        .withArgs({
          dxid: membership.user.getEntity().billTo(),
          defaultFields: false,
          fields: {
            admins: true,
          },
        })
        .resolves({})

      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, CURRENT_MEMBERSHIP_ID, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(
        InvalidStateError,
        `Pre-validation failed: Admin user not found in org ${space.guestDxOrg}; Admin user not found in org ${membership.user.getEntity().billTo()}`,
      )
    })

    it('should recover space lead successfully', async () => {
      changeLeadRoleStub.withArgs(space, membership, NEW_LEAD_USER).resolves([newLeadMembership])

      const facade = getInstance()
      await facade.recoverSpaceLead(GROUP_SPACE_ID, CURRENT_MEMBERSHIP_ID, NEW_LEAD_DXUSER)
      expect(getUserByDxuserStub.calledOnce).to.be.true()
      expect(getUserByDxuserStub.firstCall.args).to.deep.equal([NEW_LEAD_DXUSER])
      expect(transactionalStub.calledOnce).to.be.true()
      expect(populateStub.callCount).to.equal(3)
      expect(populateStub.firstCall.args).to.deep.equal([membership, ['user', 'user.organization']])
      expect(populateStub.secondCall.args).to.deep.equal([NEW_LEAD_USER, ['organization']])
      expect(populateStub.thirdCall.args).to.deep.equal([[newLeadMembership], ['spaces']])
      expect(orgDescribeStub.callCount).to.equal(4)
      expect(orgDescribeStub.getCall(0).args[0].dxid).to.equal(space.hostDxOrg)
      expect(orgDescribeStub.getCall(1).args[0].dxid).to.equal(space.guestDxOrg)
      expect(orgDescribeStub.getCall(2).args[0].dxid).to.equal(membership.user.getEntity().billTo())
      expect(orgDescribeStub.getCall(3).args[0].dxid).to.equal(NEW_LEAD_USER.billTo())
      expect(changeLeadRoleStub.calledOnce).to.be.true()
      expect(changeLeadRoleStub.firstCall.args).to.deep.equal([space, membership, NEW_LEAD_USER])
      expect(persistStub.calledOnce).to.be.true()
      expect(persistStub.firstCall.args[0].entityId).to.equal(newLeadMembership.id)
      expect(persistStub.firstCall.args[0].objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP)
      expect(persistStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      )
      expect(persistStub.firstCall.args[0].role).to.equal(membership.role)
      expect(persistStub.firstCall.args[0].side).to.equal(membership.side)
      expect(persistStub.firstCall.args[0].data).to.equal(
        JSON.stringify({
          role: 'lead',
          full_name: NEW_LEAD_USER.fullName,
        }),
      )
      expect(flushStub.calledOnce).to.be.true()
      expect(sendEmailStub.callCount).to.equal(1)
      expect(sendEmailStub.firstCall.args[0]).to.deep.include({
        type: EMAIL_TYPES.memberChangedAddedRemoved,
        input: {
          initUserId: userContext.id,
          spaceId: GROUP_SPACE_ID,
          updatedMembershipId: newLeadMembership.id,
          activityType: 'membership_changed',
          newMembershipRole: 'LEAD',
        },
      })
    })

    it('should rollback platform changes if recover failed', async () => {
      transactionalStub.throws(new Error('Test error'))

      const facade = getInstance()
      await expect(
        facade.recoverSpaceLead(GROUP_SPACE_ID, CURRENT_MEMBERSHIP_ID, NEW_LEAD_DXUSER),
      ).to.be.rejectedWith(Error, 'Test error')
      expect(createSyncSpaceLeadBillToTaskStub.calledOnce).to.be.true()
      expect(createSyncSpaceLeadBillToTaskStub.firstCall.args).to.deep.equal([membership.id])
    })
  })

  function getInstance(): SpaceMembershipUpdateFacade {
    return new SpaceMembershipUpdateFacade(
      em,
      platformClient,
      userContext,
      spaceService,
      spaceMembershipService,
      userService,
      maintenanceQueueJobProducer,
      emailService,
    )
  }
})
