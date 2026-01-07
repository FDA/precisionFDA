import { PlatformClient } from '@shared/platform-client'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { EmailService } from '@shared/domain/email/email.service'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { InvalidStateError } from '@shared/errors'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { SpaceMembershipCreateFacade } from '@shared/facade/space-membership/space-membership-create.facade'
import { Collection, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'

describe('SpaceMembershipCreateFacade', () => {
  const USER_ID = 1
  const SPACE_ID = 2
  const NEW_MEMBER_USER_ID = 3

  const userCtx = {
    id: USER_ID,
  } as UserContext

  const newMemberUser = {
    id: NEW_MEMBER_USER_ID,
    dxuser: 'testuser',
  } as User

  const adminClientInviteUserToOrganizationStub = stub()
  const spaceEventServiceCreateAndSendSpaceEventStub = stub()
  const spaceEventServiceCreateSpaceEventStub = stub()
  const emailServiceSendEmailStub = stub()
  const spaceMembershipRepoFindOneStub = stub()
  const spaceMembershipRepoPersistStub = stub()
  const spaceRepoFindEditableOneStub = stub()
  const userRepoFindOneStub = stub()
  let referenceCreateStub: SinonStub
  let collectionStub: SinonStub

  const createSpaceMembershipCreateFacade = () => {
    const adminClient = {
      inviteUserToOrganization: adminClientInviteUserToOrganizationStub,
    } as unknown as PlatformClient

    const spaceEventService = {
      createAndSendSpaceEvent: spaceEventServiceCreateAndSendSpaceEventStub,
      createSpaceEvent: spaceEventServiceCreateSpaceEventStub,
    } as unknown as SpaceEventService

    const emailService = {
      sendEmail: emailServiceSendEmailStub,
    } as unknown as EmailService

    const spaceMembershipRepo = {
      findOne: spaceMembershipRepoFindOneStub,
      persist: spaceMembershipRepoPersistStub,
    } as unknown as SpaceMembershipRepository

    const spaceRepo = {
      findEditableOne: spaceRepoFindEditableOneStub,
    } as unknown as SpaceRepository

    const userRepo = {
      findOne: userRepoFindOneStub,
    } as unknown as UserRepository

    const em = {
      transactional: async <T>(callback: (em: SqlEntityManager) => Promise<T>): Promise<T> => {
        return callback(em as SqlEntityManager)
      },
    } as unknown as SqlEntityManager

    return new SpaceMembershipCreateFacade(
      em,
      adminClient,
      userCtx,
      spaceEventService,
      emailService,
      spaceMembershipRepo,
      spaceRepo,
      userRepo,
    )
  }

  beforeEach(() => {
    referenceCreateStub = stub(Reference, 'create')
    collectionStub = stub(Collection.prototype, 'add')
    referenceCreateStub.withArgs(newMemberUser).returns(newMemberUser)

    adminClientInviteUserToOrganizationStub.reset()
    adminClientInviteUserToOrganizationStub.throws()

    spaceEventServiceCreateAndSendSpaceEventStub.reset()
    spaceEventServiceCreateAndSendSpaceEventStub.throws()

    spaceEventServiceCreateSpaceEventStub.reset()
    spaceEventServiceCreateSpaceEventStub.throws()

    emailServiceSendEmailStub.reset()
    emailServiceSendEmailStub.throws()

    spaceMembershipRepoFindOneStub.reset()
    spaceMembershipRepoFindOneStub.throws()

    spaceMembershipRepoPersistStub.reset()
    spaceMembershipRepoPersistStub.throws()

    spaceRepoFindEditableOneStub.reset()
    spaceRepoFindEditableOneStub.throws()

    userRepoFindOneStub.reset()
    userRepoFindOneStub.throws()
  })

  afterEach(() => {
    referenceCreateStub.restore()
    collectionStub.restore()
  })

  describe('#createMembership', () => {
    it('creates membership for group space with admin role and sends email notification', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.ACTIVE,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const newMemberUser = {
        id: NEW_MEMBER_USER_ID,
        dxuser: 'testuser',
      } as User

      spaceRepoFindEditableOneStub
        .withArgs({
          id: SPACE_ID,
          spaceMemberships: {
            role: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD],
          },
        })
        .returns(space)

      userRepoFindOneStub.withArgs({ id: NEW_MEMBER_USER_ID }).returns(newMemberUser)
      spaceMembershipRepoFindOneStub
        .withArgs({
          spaces: space,
          user: newMemberUser,
        })
        .returns(null)

      adminClientInviteUserToOrganizationStub.reset()
      spaceMembershipRepoPersistStub.reset()
      emailServiceSendEmailStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      const result = await facade.createMembership(
        SPACE_ID,
        NEW_MEMBER_USER_ID,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
        true,
      )

      expect(result).to.be.instanceOf(SpaceMembership)
      expect(result.user.id).to.eq(newMemberUser.id)
      expect(result.side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(result.role).to.equal(SPACE_MEMBERSHIP_ROLE.ADMIN)

      // Verify invitations to both organizations
      expect(adminClientInviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.firstCall.calledWith({
          orgDxId: 'host-org-123',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.secondCall.calledWith({
          orgDxId: 'guest-org-456',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()

      expect(spaceMembershipRepoPersistStub.calledOnce).to.be.true()
      expect(spaceMembershipRepoPersistStub.calledWith(result)).to.be.true()

      expect(emailServiceSendEmailStub.calledOnce).to.be.true()
      expect(
        emailServiceSendEmailStub.calledWith({
          type: EMAIL_TYPES.spaceInvitation,
          input: {
            membershipId: NEW_MEMBER_USER_ID,
            adminId: USER_ID,
          },
        }),
      ).to.be.true()

      expect(spaceEventServiceCreateAndSendSpaceEventStub.calledOnce).to.be.true()
      const spaceEventCall = spaceEventServiceCreateAndSendSpaceEventStub.firstCall.args[0]
      expect(spaceEventCall.spaceId).to.equal(SPACE_ID)
      expect(spaceEventCall.userId).to.equal(NEW_MEMBER_USER_ID)
      expect(spaceEventCall.activityType).to.equal(SPACE_EVENT_ACTIVITY_TYPE.membership_added)
    })

    it('creates membership without sending email notification', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.ACTIVE,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      spaceRepoFindEditableOneStub
        .withArgs({
          id: SPACE_ID,
          spaceMemberships: {
            role: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD],
          },
        })
        .returns(space)

      userRepoFindOneStub.withArgs({ id: NEW_MEMBER_USER_ID }).returns(newMemberUser)
      spaceMembershipRepoFindOneStub
        .withArgs({
          spaces: space,
          user: newMemberUser,
        })
        .returns(null)

      adminClientInviteUserToOrganizationStub.reset()
      spaceMembershipRepoPersistStub.reset()
      emailServiceSendEmailStub.reset()
      spaceEventServiceCreateSpaceEventStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      const result = await facade.createMembership(
        SPACE_ID,
        NEW_MEMBER_USER_ID,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
        false,
      )

      expect(result).to.be.instanceOf(SpaceMembership)

      expect(emailServiceSendEmailStub.called).to.be.false()
      expect(spaceEventServiceCreateAndSendSpaceEventStub.called).to.be.false()
      expect(spaceEventServiceCreateSpaceEventStub.calledOnce).to.be.true()
    })

    it('creates membership with contributor role', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.ACTIVE,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const newMemberUser = {
        id: NEW_MEMBER_USER_ID,
        dxuser: 'testuser',
      } as User

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)
      spaceMembershipRepoFindOneStub.returns(null)

      adminClientInviteUserToOrganizationStub.reset()
      spaceMembershipRepoPersistStub.reset()
      emailServiceSendEmailStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      await facade.createMembership(
        SPACE_ID,
        NEW_MEMBER_USER_ID,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      )

      expect(adminClientInviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.firstCall.calledWith({
          orgDxId: 'guest-org-456',
          data: {
            invitee: 'user-testuser',
            level: 'MEMBER',
            projectAccess: 'CONTRIBUTE',
            allowBillableActivities: false,
            appAccess: true,
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.secondCall.calledWith({
          orgDxId: 'host-org-123',
          data: {
            invitee: 'user-testuser',
            level: 'MEMBER',
            projectAccess: 'CONTRIBUTE',
            allowBillableActivities: false,
            appAccess: true,
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
    })

    it('creates membership with viewer role', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.ACTIVE,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const newMemberUser = {
        id: NEW_MEMBER_USER_ID,
        dxuser: 'testuser',
      } as User

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)
      spaceMembershipRepoFindOneStub.returns(null)

      adminClientInviteUserToOrganizationStub.reset()
      spaceMembershipRepoPersistStub.reset()
      emailServiceSendEmailStub.reset()
      spaceEventServiceCreateAndSendSpaceEventStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      await facade.createMembership(
        SPACE_ID,
        NEW_MEMBER_USER_ID,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      )

      expect(adminClientInviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.firstCall.calledWith({
          orgDxId: 'host-org-123',
          data: {
            invitee: 'user-testuser',
            level: 'MEMBER',
            projectAccess: 'VIEW',
            allowBillableActivities: false,
            appAccess: false,
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.secondCall.calledWith({
          orgDxId: 'guest-org-456',
          data: {
            invitee: 'user-testuser',
            level: 'MEMBER',
            projectAccess: 'VIEW',
            allowBillableActivities: false,
            appAccess: false,
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
    })

    it('throws error when space is not found', async () => {
      spaceRepoFindEditableOneStub.returns(null)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(InvalidStateError, 'Target space was not found or is not accessible')
    })

    it('throws error when space is not active', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.DELETED,
      } as Space

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(InvalidStateError, 'You cannot create membership for non-active space')
    })

    it('throws error when space is private type', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.PRIVATE_TYPE,
        state: SPACE_STATE.ACTIVE,
      } as Space

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(InvalidStateError, 'You cannot create new memberships for private space')
    })

    it('throws error when space is administrator type', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.ADMINISTRATOR,
        state: SPACE_STATE.ACTIVE,
      } as Space

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'You cannot create new memberships for administrator space, access is managed automatically',
      )
    })

    it('throws error when space is verification type', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.VERIFICATION,
        state: SPACE_STATE.ACTIVE,
      } as Space

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'You cannot create new memberships for verification space - DEPRECATED',
      )
    })

    it('throws error when space is review type', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.REVIEW,
        state: SPACE_STATE.ACTIVE,
      } as Space

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'Creating memberships for review spaces is not supported yet',
      )
    })

    it('throws error when user is already a member', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.GROUPS,
        state: SPACE_STATE.ACTIVE,
      } as Space

      const newMemberUser = {
        id: NEW_MEMBER_USER_ID,
        dxuser: 'testuser',
      } as User

      const existingMembership = {
        id: 1,
        user: newMemberUser,
        space: space,
      } as unknown as SpaceMembership

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)
      spaceMembershipRepoFindOneStub.returns(existingMembership)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'User testuser is already a member of space Test Space',
      )
    })

    it('throws error for unsupported space type in inviteUserToPlatformSpaceOrganizations', async () => {
      const space = {
        id: SPACE_ID,
        name: 'Test Space',
        type: SPACE_TYPE.VERIFICATION,
        state: SPACE_STATE.ACTIVE,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const newMemberUser = {
        id: NEW_MEMBER_USER_ID,
        dxuser: 'testuser',
      } as User

      spaceRepoFindEditableOneStub.returns(space)
      userRepoFindOneStub.returns(newMemberUser)
      spaceMembershipRepoFindOneStub.returns(null)

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.createMembership(
          SPACE_ID,
          NEW_MEMBER_USER_ID,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'You cannot create new memberships for verification space - DEPRECATED',
      )
    })
  })

  describe('#inviteUserToPlatformSpaceOrganizations', () => {
    it('invites admin to both organizations in groups space', async () => {
      const space = {
        type: SPACE_TYPE.GROUPS,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const user = {
        dxuser: 'testuser',
      } as User

      adminClientInviteUserToOrganizationStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      await facade.inviteUserToPlatformSpaceOrganizations(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )

      expect(adminClientInviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.firstCall.calledWith({
          orgDxId: 'host-org-123',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.secondCall.calledWith({
          orgDxId: 'guest-org-456',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
    })

    it('invites lead to both organizations in groups space', async () => {
      const space = {
        type: SPACE_TYPE.GROUPS,
        hostDxOrg: 'host-org-123',
        guestDxOrg: 'guest-org-456',
      } as Space

      const user = {
        dxuser: 'testuser',
      } as User

      adminClientInviteUserToOrganizationStub.reset()

      const facade = createSpaceMembershipCreateFacade()

      await facade.inviteUserToPlatformSpaceOrganizations(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )

      expect(adminClientInviteUserToOrganizationStub.calledTwice).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.firstCall.calledWith({
          orgDxId: 'guest-org-456',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
      expect(
        adminClientInviteUserToOrganizationStub.secondCall.calledWith({
          orgDxId: 'host-org-123',
          data: {
            invitee: 'user-testuser',
            level: 'ADMIN',
            suppressEmailNotification: true,
          },
        }),
      ).to.be.true()
    })

    it('throws error for review space type', async () => {
      const space = {
        type: SPACE_TYPE.REVIEW,
      } as Space

      const user = {
        dxuser: 'testuser',
      } as User

      const facade = createSpaceMembershipCreateFacade()

      await expect(
        facade.inviteUserToPlatformSpaceOrganizations(
          user,
          space,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.ADMIN,
        ),
      ).to.be.rejectedWith(
        InvalidStateError,
        'Creating memberships for review spaces is not supported yet',
      )
    })
  })
})
