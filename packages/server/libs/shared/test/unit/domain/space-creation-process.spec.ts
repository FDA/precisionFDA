import { Reference } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { AdministratorSpaceCreationProcess } from '@shared/domain/space/create/administrator-space-creation.process'
import { GovernmentSpaceCreationProcess } from '@shared/domain/space/create/government-space-creation.process'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { PrivateSpaceCreationProcess } from '@shared/domain/space/create/private-space-creation.process'
import { ReviewSpaceCreationProcess } from '@shared/domain/space/create/review-space-creation.process'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { PlatformClient } from '@shared/platform-client'
import { ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import * as generate from '@shared/test/generate'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('space creation process tests', () => {
  const SHARED_SPACE_ID = 2
  const GUEST_PRIVATE_SPACE_ID = 12
  const HOST_PRIVATE_SPACE_ID = 13
  const SINGLE_SPACE_ID = 15
  const GUEST_ORG_ID = 20
  const HOST_ORG_ID = 25

  let userCtx: UserContext
  let emMocked: EntityManager<MySqlDriver>
  let platformClient: PlatformClient
  let adminPlatformClient: PlatformClient
  let spaceNotificationService: SpaceNotificationService
  let taggingService: TaggingService
  let userRepository: UserRepository
  let referenceStub

  const createOrgStub = stub()
  const inviteUserToOrgStub = stub()
  const projectCreateStub = stub()
  const projectInviteStub = stub()
  const notifySpaceCreatedStub = stub()
  const userRepoFindOneStub = stub()
  const emFindOneStub = stub()
  const emPersistAndFlushStub = stub()
  const emCreateStub = stub()
  const emTransactionalStub = stub()
  const emPopulateStub = stub()
  const emPersistStub = stub()
  const emFindStub = stub()
  const addTaggingForEntityStub = stub()

  const siteAdmin = {
    id: 1,
    dxuser: 'siteAdminDxuser',
    getEntity: (): User => {
      return {
        billTo: () => 'admin-bill-to',
      } as User
    },
    isSiteAdmin: (): boolean => true,
    isGovUser: (): boolean => false,
    getProperty: (prop: string): string => {
      if (prop === 'dxuser') return 'siteAdminDxuser'
      return undefined
    },
  }
  const hostLeadUser = {
    id: 3,
    dxuser: 'hostLeadDxuser',
    isSiteAdmin: (): boolean => false,
    isReviewSpaceAdmin: (): boolean => true,
    isGovUser: (): boolean => true,
    getEntity: (): User => {
      return {
        billTo: (): string => 'host-bill-to',
      } as User
    },
    getProperty: (prop: string): string => {
      if (prop === 'dxuser') return 'hostLeadDxuser'
      return undefined
    },
  }
  const guestLeadUser = {
    id: 4,
    dxuser: 'guestLeadDxuser',
    organization: { id: GUEST_ORG_ID },
    getEntity: (): User => {
      return {
        billTo: () => 'guest-bill-to',
      } as User
    },
    getProperty: (prop: string): string => {
      if (prop === 'dxuser') return 'guestLeadDxuser'
      return undefined
    },
  }

  beforeEach(async () => {
    platformClient = {
      inviteUserToOrganization: inviteUserToOrgStub,
      createOrg: createOrgStub,
      projectCreate: projectCreateStub,
      projectInvite: projectInviteStub,
    } as unknown as PlatformClient

    adminPlatformClient = {
      inviteUserToOrganization: inviteUserToOrgStub,
      createOrg: createOrgStub,
      projectCreate: projectCreateStub,
      projectInvite: projectInviteStub,
    } as unknown as PlatformClient

    spaceNotificationService = {
      notifySpaceCreated: notifySpaceCreatedStub,
    } as unknown as SpaceNotificationService

    userRepository = {
      findOne: userRepoFindOneStub,
    } as unknown as UserRepository

    taggingService = {
      addTaggingForEntity: addTaggingForEntityStub,
    } as unknown as TaggingService

    emMocked = {
      find: emFindStub,
      findOne: emFindOneStub,
      persist: emPersistStub,
      persistAndFlush: emPersistAndFlushStub,
      create: emCreateStub,
      transactional: emTransactionalStub,
      populate: emPopulateStub,
    } as unknown as EntityManager<MySqlDriver>

    createOrgStub.reset()
    projectCreateStub.reset()
    projectInviteStub.reset()
    notifySpaceCreatedStub.reset()
    emFindStub.reset()

    projectCreateStub.returns({ id: `project-${generate.random.dxstr()}` } as ClassIdResponse)
    createOrgStub.returns({ id: `org-${generate.random.dxstr()}` } as ClassIdResponse)

    emTransactionalStub.callsFake(async (callback) => {
      return callback(emTransactionalStub)
    })

    userRepoFindOneStub.reset()
    userRepoFindOneStub.throws()

    emFindOneStub.reset()
    emFindOneStub.throws()

    emPersistAndFlushStub.reset()
    emPersistAndFlushStub.throws()

    addTaggingForEntityStub.reset()
    addTaggingForEntityStub.throws()

    emPersistStub.reset()

    referenceStub = stub(Reference, 'create')

    emFindOneStub
      .withArgs(User, {
        id: siteAdmin.id,
        userState: USER_STATE.ENABLED,
      })
      .resolves(siteAdmin)
    emFindOneStub
      .withArgs(User, {
        dxuser: hostLeadUser.dxuser,
        userState: { $ne: USER_STATE.DEACTIVATED },
      })
      .resolves(hostLeadUser)
    emFindOneStub
      .withArgs(User, {
        dxuser: guestLeadUser.dxuser,
        userState: { $ne: USER_STATE.DEACTIVATED },
      })
      .resolves(guestLeadUser)
    emPersistAndFlushStub.reset()
    emPersistAndFlushStub.callsFake(async (entity) => {
      entity.id = SINGLE_SPACE_ID // setting group space id
    })
    createOrgStub.callsFake((handle) => {
      if (handle.includes('guest')) {
        return { id: GUEST_ORG_ID }
      }
      return { id: HOST_ORG_ID }
    })
    inviteUserToOrgStub.reset()
    emPersistStub.reset()
    emPopulateStub.reset()

    referenceStub.withArgs(siteAdmin).returns(siteAdmin)
    referenceStub.withArgs(hostLeadUser).returns(hostLeadUser)
    referenceStub.withArgs(guestLeadUser).returns(guestLeadUser)
  })

  afterEach(() => {
    referenceStub.restore()
  })

  describe('create groups space', () => {
    it('as site admin', async () => {
      addTaggingForEntityStub.reset()

      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GROUPS
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser
      input.guestLeadDxuser = guestLeadUser.dxuser
      input.protected = true
      input.forChallenge = false
      input.restrictedReviewer = false

      const res = await groupsProcess(siteAdmin.dxuser, siteAdmin.id).build(input)
      expect(res).eq(SINGLE_SPACE_ID)
      expect(createOrgStub.calledTwice).to.be.true()
      expect(inviteUserToOrgStub.callCount).to.be.eq(4)
      expect(projectCreateStub.calledTwice).to.be.true()
      expect(projectInviteStub.callCount).to.eq(4)
      expect(notifySpaceCreatedStub.calledTwice).to.be.true()

      // TODO more detailed expects for the call attributes
    })

    it('challenge groups space as site admin', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GROUPS
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser
      input.guestLeadDxuser = guestLeadUser.dxuser
      input.protected = false
      input.forChallenge = true
      input.restrictedReviewer = false

      const challengeBotUser = {
        dxuser: config.platform.challengeBotUser,
      }

      emFindOneStub
        .withArgs(User, { dxuser: config.platform.challengeBotUser })
        .resolves({ challengeBotUser })

      const res = await groupsProcess(siteAdmin.dxuser, siteAdmin.id).build(input)
      expect(res).eq(SINGLE_SPACE_ID)
      expect(createOrgStub.calledTwice).to.be.true()
      expect(inviteUserToOrgStub.callCount).to.be.eq(6)
      expect(projectCreateStub.calledTwice).to.be.true()
      expect(projectInviteStub.callCount).to.eq(4)
      expect(notifySpaceCreatedStub.calledTwice).to.be.true()

      // TODO more detailed expects for the call attributes
    })

    it('non-admin - should fail', async () => {
      const nonAdminUser = {
        id: 2,
        dxuser: 'nonAdminDxuser',
        isSiteAdmin: (): boolean => false,
        isReviewSpaceAdmin: (): boolean => false,
      }

      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GROUPS
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser
      input.guestLeadDxuser = guestLeadUser.dxuser
      input.protected = true
      input.forChallenge = false
      input.restrictedReviewer = false

      emFindOneStub
        .withArgs(User, {
          id: nonAdminUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(nonAdminUser)

      try {
        await groupsProcess(nonAdminUser.dxuser, nonAdminUser.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq('Only admins can create Groups spaces')
      }
    })
  })

  describe('create private space', () => {
    it('basic', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.PRIVATE_TYPE
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser

      emFindOneStub
        .withArgs(User, {
          id: hostLeadUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(hostLeadUser)

      const res = await privateProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)
      expect(res).eq(SINGLE_SPACE_ID)
      expect(createOrgStub.calledOnce).to.be.true()

      // TODO more detailed expects for the call attributes
    })

    it('for another user - should fail', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.PRIVATE_TYPE
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = guestLeadUser.dxuser

      emFindOneStub
        .withArgs(User, {
          id: hostLeadUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(hostLeadUser)

      try {
        await privateProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq(
          'You are not allowed to create new Private Space for another user!',
        )
      }
    })
  })

  describe('create administrator space', () => {
    it('basic', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.ADMINISTRATOR
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = siteAdmin.dxuser

      emFindOneStub
        .withArgs(User, {
          dxuser: siteAdmin.dxuser,
          userState: { $ne: USER_STATE.DEACTIVATED },
        })
        .resolves(siteAdmin)
      emFindStub
        .withArgs(User, {
          dxuser: { $ne: siteAdmin.dxuser },
          adminMemberships: {
            adminGroup: { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN },
          },
        })
        .returns([guestLeadUser])

      const res = await administratorProcess(siteAdmin.dxuser, siteAdmin.id).build(input)
      expect(res).eq(SINGLE_SPACE_ID)
      expect(createOrgStub.calledOnce).to.be.true()
      expect(inviteUserToOrgStub.callCount).to.eq(2)

      // TODO more detailed expects for the call attributes
    })

    it('as regular user - should fail', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.ADMINISTRATOR
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser

      emFindOneStub
        .withArgs(User, {
          id: hostLeadUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(hostLeadUser)

      try {
        await administratorProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq('Only admins can create Administrator space')
      }
    })

    it('for another user - should fail', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.ADMINISTRATOR
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = guestLeadUser.dxuser

      try {
        await administratorProcess(siteAdmin.dxuser, siteAdmin.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq(
          'You are not allowed to create new Administrator Space for another user!',
        )
      }
    })
  })

  describe('create government space', () => {
    it('basic', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GOVERNMENT
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = hostLeadUser.dxuser

      emFindOneStub
        .withArgs(User, {
          id: hostLeadUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(hostLeadUser)

      const res = await governmentProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)
      expect(res).eq(SINGLE_SPACE_ID)
      expect(createOrgStub.calledOnce).to.be.true()

      // TODO more detailed expects for the call attributes
    })

    it('for another user - should fail', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GOVERNMENT
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = guestLeadUser.dxuser

      emFindOneStub
        .withArgs(User, {
          id: hostLeadUser.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(hostLeadUser)

      try {
        await governmentProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq(
          'You are not allowed to create new Government Space for another user!',
        )
      }
    })

    it('as regular user - should fail', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.GOVERNMENT
      input.name = 'test'
      input.description = 'test'
      input.hostLeadDxuser = siteAdmin.dxuser

      emFindOneStub
        .withArgs(User, {
          id: siteAdmin.id,
          userState: USER_STATE.ENABLED,
        })
        .resolves(siteAdmin)

      try {
        await governmentProcess(siteAdmin.dxuser, siteAdmin.id).build(input)
        expect.fail('Operation is expected to fail.')
      } catch (error) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).eq('Only government users can create Government space!')
      }
    })
  })

  describe('create review space', () => {
    it('sponsor and reviewer must be different', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.REVIEW
      input.guestLeadDxuser = 'the-same'
      input.hostLeadDxuser = 'the-same'

      await expect(reviewProcess('dxuser', 1).build(input)).to.be.rejectedWith(
        Error,
        'Sponsor and Reviewer leads must be different users',
      )
    })

    it('restricted reviewer is not FDA-asscociated', async () => {
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.REVIEW
      input.guestLeadDxuser = 'guestLeadDxuser'
      input.hostLeadDxuser = 'hostLeadDxuser'
      input.restrictedReviewer = true
      const hostUser = {
        id: 1,
        dxuser: 'host',
        isGovUser: (): boolean => false,
      }
      userRepoFindOneStub.reset()
      userRepoFindOneStub.withArgs({ dxuser: 'hostLeadDxuser' }).resolves(hostUser)

      await expect(reviewProcess('dxuser', 1).build(input)).to.be.rejectedWith(
        Error,
        `Reviewer lead ${hostUser.dxuser} is not an FDA-associated user`,
      )
    })

    it('checkPermissions - user not found', async () => {
      const USER_ID = 1
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.REVIEW
      input.guestLeadDxuser = 'guestLeadDxuser'
      input.hostLeadDxuser = 'hostLeadDxuser'

      emFindOneStub.withArgs(User, { id: USER_ID, userState: USER_STATE.ENABLED }).resolves(null)

      await expect(reviewProcess('dxuser', 1).build(input)).to.be.rejectedWith(
        Error,
        `User with ID: ${USER_ID} was not found!`,
      )
    })

    it('checkPermissions - user is not ReviewSpaceAdmin', async () => {
      const USER_ID = 1
      const input = new CreateSpaceDTO()
      input.spaceType = SPACE_TYPE.REVIEW
      input.guestLeadDxuser = 'guestLeadDxuser'
      input.hostLeadDxuser = 'hostLeadDxuser'
      const user = {
        isReviewSpaceAdmin: (): boolean => false,
      }

      emFindOneStub.withArgs(User, { id: USER_ID, userState: USER_STATE.ENABLED }).resolves(user)

      await expect(reviewProcess('dxuser', 1).build(input)).to.be.rejectedWith(
        Error,
        'Only review space admins can create Review spaces',
      )
    })

    it('basic', async () => {
      const input = new CreateSpaceDTO()
      input.name = 'name'
      input.description = 'description'
      input.spaceType = SPACE_TYPE.REVIEW
      input.guestLeadDxuser = guestLeadUser.dxuser
      input.hostLeadDxuser = hostLeadUser.dxuser
      input.protected = true
      input.restrictedReviewer = true

      emFindOneStub
        .withArgs(User, { id: hostLeadUser.id, userState: USER_STATE.ENABLED })
        .resolves(hostLeadUser)
      emFindOneStub
        .withArgs(User, {
          dxuser: hostLeadUser.dxuser,
          userState: { $ne: USER_STATE.DEACTIVATED },
        })
        .resolves(hostLeadUser)
      emFindOneStub
        .withArgs(User, {
          dxuser: guestLeadUser.dxuser,
          userState: { $ne: USER_STATE.DEACTIVATED },
        })
        .resolves(guestLeadUser)
      userRepoFindOneStub
        .withArgs({ dxuser: input.guestLeadDxuser }, { populate: ['organization'] })
        .resolves(guestLeadUser)
      userRepoFindOneStub.withArgs({ dxuser: input.hostLeadDxuser }).resolves(hostLeadUser)
      emPersistAndFlushStub.reset()
      emPersistAndFlushStub.callsFake(async (entity) => {
        entity.id = SHARED_SPACE_ID // setting shared space id
        if (entity.sponsorOrgId) {
          // It's a shared space, so set confidential spaces
          const confidentialSponsorSpace = new Space()
          confidentialSponsorSpace.id = GUEST_PRIVATE_SPACE_ID
          const confidentialReviewerSpace = new Space()
          confidentialReviewerSpace.id = HOST_PRIVATE_SPACE_ID
          stub(entity, 'confidentialSponsorSpace').get(() => confidentialSponsorSpace)
          stub(entity, 'confidentialReviewerSpace').get(() => confidentialReviewerSpace)
        }
      })
      addTaggingForEntityStub.reset()
      emCreateStub.callsFake((entityClass, entityData) => entityData)
      emPopulateStub.resolves({})
      createOrgStub.callsFake((handle) => {
        if (handle.includes('guest')) {
          return { id: GUEST_ORG_ID }
        }
        return { id: HOST_ORG_ID }
      })
      inviteUserToOrgStub.reset()
      emPersistStub.reset()
      referenceStub.withArgs(hostLeadUser).returns(hostLeadUser)
      referenceStub.withArgs(guestLeadUser).returns(guestLeadUser)

      await reviewProcess(hostLeadUser.dxuser, hostLeadUser.id).build(input)

      expect(userRepoFindOneStub.calledTwice).to.be.true()
      expect(userRepoFindOneStub.calledWith({ dxuser: input.hostLeadDxuser })).to.be.true()
      expect(
        userRepoFindOneStub.calledWith(
          { dxuser: input.guestLeadDxuser },
          { populate: ['organization'] },
        ),
      ).to.be.true()

      expect(emFindOneStub.calledThrice).to.be.true()
      expect(
        emFindOneStub.calledWith(User, { id: hostLeadUser.id, userState: USER_STATE.ENABLED }),
      ).to.be.true()
      expect(
        emFindOneStub.calledWith(User, {
          dxuser: hostLeadUser.dxuser,
          userState: { $ne: USER_STATE.DEACTIVATED },
        }),
      ).to.be.true()
      expect(
        emFindOneStub.calledWith(User, {
          dxuser: guestLeadUser.dxuser,
          userState: { $ne: USER_STATE.DEACTIVATED },
        }),
      ).to.be.true()

      expect(emPersistAndFlushStub.calledOnce).to.be.true()
      expect(emPersistAndFlushStub.firstCall.args[0].type).to.be.eq(SPACE_TYPE.REVIEW)

      expect(addTaggingForEntityStub.calledTwice).to.be.true()
      expect(addTaggingForEntityStub.firstCall.args[0]).to.be.eq('Protected')
      expect(addTaggingForEntityStub.firstCall.args[1]).to.be.eq('User')
      expect(addTaggingForEntityStub.firstCall.args[2]).to.be.eq(hostLeadUser.id)
      expect(addTaggingForEntityStub.firstCall.args[3]).to.be.eq(SHARED_SPACE_ID)
      expect(addTaggingForEntityStub.firstCall.args[4]).to.be.eq(TAGGABLE_TYPE.SPACE)
      expect(addTaggingForEntityStub.secondCall.args[0]).to.be.eq('FDA-restricted')
      expect(addTaggingForEntityStub.secondCall.args[1]).to.be.eq('User')
      expect(addTaggingForEntityStub.secondCall.args[2]).to.be.eq(hostLeadUser.id)
      expect(addTaggingForEntityStub.secondCall.args[3]).to.be.eq(SHARED_SPACE_ID)
      expect(addTaggingForEntityStub.secondCall.args[4]).to.be.eq(TAGGABLE_TYPE.SPACE)

      expect(emCreateStub.calledTwice).to.be.true()
      expect(emCreateStub.firstCall.args[0]).to.be.eq(Space)
      expect(emCreateStub.firstCall.args[1].spaceId).to.be.eq(SHARED_SPACE_ID)
      expect(emCreateStub.firstCall.args[1].name).to.be.eq('name')
      expect(emCreateStub.firstCall.args[1].description).to.be.eq('description')
      expect(emCreateStub.firstCall.args[1].type).to.be.eq(SPACE_TYPE.REVIEW)
      expect(emCreateStub.firstCall.args[1].state).to.be.eq(SPACE_STATE.ACTIVE)
      expect(emCreateStub.firstCall.args[1].protected).to.be.true()
      expect(emCreateStub.firstCall.args[1].hostDxOrg).to.contain('host')
      expect(emCreateStub.firstCall.args[1].guestDxOrg).to.be.null()
      expect(emCreateStub.secondCall.args[0]).to.be.eq(Space)
      expect(emCreateStub.secondCall.args[1].spaceId).to.be.eq(SHARED_SPACE_ID)
      expect(emCreateStub.secondCall.args[1].name).to.be.eq('name')
      expect(emCreateStub.secondCall.args[1].description).to.be.eq('description')
      expect(emCreateStub.secondCall.args[1].type).to.be.eq(SPACE_TYPE.REVIEW)
      expect(emCreateStub.secondCall.args[1].state).to.be.eq(SPACE_STATE.ACTIVE)
      expect(emCreateStub.secondCall.args[1].protected).to.be.true()
      expect(emCreateStub.secondCall.args[1].hostDxOrg).to.be.null()
      expect(emCreateStub.secondCall.args[1].guestDxOrg).to.contain('guest')

      expect(emPopulateStub.calledTwice).to.be.true()
      expect(emPopulateStub.firstCall.args[1]).to.deep.eq(['confidentialSpaces'])
      expect(emPopulateStub.firstCall.args[2]).to.deep.eq({ refresh: true })

      expect(createOrgStub.calledTwice).to.be.true()
      expect(createOrgStub.firstCall.args[0]).to.contain('host')
      expect(createOrgStub.firstCall.args[1]).to.contain('host')
      expect(createOrgStub.secondCall.args[0]).to.contain('guest')
      expect(createOrgStub.secondCall.args[1]).to.contain('guest')

      expect(emPopulateStub.secondCall.args[0].length).to.eq(2) // hostLead and guestLead
      expect(emPopulateStub.secondCall.args[0][0].role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(emPopulateStub.secondCall.args[0][0].side).to.eq(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(emPopulateStub.secondCall.args[0][1].role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(emPopulateStub.secondCall.args[0][1].side).to.eq(SPACE_MEMBERSHIP_SIDE.GUEST)

      expect(projectCreateStub.callCount).to.eq(4)
      expect(projectCreateStub.firstCall.args[0]).to.eq('precisionfda-space-2-HOST')
      expect(projectCreateStub.firstCall.args[1]).to.eq('host-bill-to')
      expect(projectCreateStub.secondCall.args[0]).to.eq('precisionfda-space-2-GUEST')
      expect(projectCreateStub.secondCall.args[1]).to.eq('guest-bill-to')
      expect(projectCreateStub.thirdCall.args[0]).to.eq('precisionfda-space-2-REVIEWER-PRIVATE')
      expect(projectCreateStub.thirdCall.args[1]).to.eq('host-bill-to')
      expect(projectCreateStub.getCall(3).args[0]).to.eq('precisionfda-space-2-SPONSOR-PRIVATE')
      const guestProjectId = projectCreateStub.firstCall.returnValue.id
      const hostProjectId = projectCreateStub.secondCall.returnValue.id
      const hostPrivateProjectId = projectCreateStub.thirdCall.returnValue.id
      const guestPrivateProjectId = projectCreateStub.getCall(3).returnValue.id

      expect(projectCreateStub.getCall(3).args[1]).to.eq('guest-bill-to')
      expect(projectInviteStub.callCount).to.eq(6)
      expect(projectInviteStub.firstCall.args[0]).to.eq(hostProjectId)
      expect(projectInviteStub.firstCall.args[1]).to.contain('host')
      expect(projectInviteStub.firstCall.args[2]).to.contain('CONTRIBUTE')
      expect(projectInviteStub.secondCall.args[0]).to.eq(hostProjectId)
      expect(projectInviteStub.secondCall.args[1]).to.contain('guest')
      expect(projectInviteStub.secondCall.args[2]).to.contain('CONTRIBUTE')
      expect(projectInviteStub.thirdCall.args[0]).to.eq(guestProjectId)
      expect(projectInviteStub.thirdCall.args[1]).to.contain('host')
      expect(projectInviteStub.thirdCall.args[2]).to.contain('CONTRIBUTE')
      expect(projectInviteStub.getCall(3).args[0]).to.eq(guestProjectId)
      expect(projectInviteStub.getCall(3).args[1]).to.contain('guest')
      expect(projectInviteStub.getCall(3).args[2]).to.contain('CONTRIBUTE')
      expect(projectInviteStub.getCall(4).args[0]).to.eq(hostPrivateProjectId)
      expect(projectInviteStub.getCall(4).args[1]).to.contain('host')
      expect(projectInviteStub.getCall(4).args[2]).to.contain('CONTRIBUTE')
      expect(projectInviteStub.getCall(5).args[0]).to.eq(guestPrivateProjectId)
      expect(projectInviteStub.getCall(5).args[1]).to.contain('guest')
      expect(projectInviteStub.getCall(5).args[2]).to.contain('CONTRIBUTE')

      expect(emPersistStub.callCount).to.eq(6)
      expect(emPersistStub.firstCall.args[0].spaceId).to.be.eq(SHARED_SPACE_ID)
      expect(emPersistStub.secondCall.args[0].spaceId).to.be.eq(SHARED_SPACE_ID)
      expect(emPersistStub.thirdCall.args[0].length).to.eq(2)
      expect(emPersistStub.thirdCall.args[0][0].side).to.eq(SPACE_MEMBERSHIP_SIDE.HOST)
      expect(emPersistStub.thirdCall.args[0][0].role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(emPersistStub.thirdCall.args[0][1].side).to.eq(SPACE_MEMBERSHIP_SIDE.GUEST)
      expect(emPersistStub.thirdCall.args[0][1].role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(emPersistStub.getCall(3).args[0].id).to.eq(SHARED_SPACE_ID)
      expect(emPersistStub.getCall(4).args[0].id).to.eq(GUEST_PRIVATE_SPACE_ID)
      expect(emPersistStub.getCall(4).args[0].guestProject).to.eq(guestProjectId)
      expect(emPersistStub.getCall(5).args[0].id).to.eq(HOST_PRIVATE_SPACE_ID)
      expect(emPersistStub.getCall(5).args[0].hostProject).to.eq(hostProjectId)

      expect(notifySpaceCreatedStub.calledTwice).to.be.true()
      expect(notifySpaceCreatedStub.firstCall.args[0].id).to.eq(SHARED_SPACE_ID)
      expect(notifySpaceCreatedStub.firstCall.args[1].billTo()).to.eq('host-bill-to')
      expect(notifySpaceCreatedStub.secondCall.args[0].id).to.eq(SHARED_SPACE_ID)
      expect(notifySpaceCreatedStub.secondCall.args[1].billTo()).to.eq('guest-bill-to')
    })
  })

  function reviewProcess(dxuser: string, userId: number): ReviewSpaceCreationProcess {
    userCtx = {
      dxuser,
      id: userId,
      accessToken: 'secret-token',
      loadEntity: async (): Promise<User> => null,
    }
    return new ReviewSpaceCreationProcess(
      userCtx,
      emMocked,
      spaceNotificationService,
      taggingService,
      adminPlatformClient,
      userRepository,
    )
  }

  function groupsProcess(dxuser: string, userId: number): GroupsSpaceCreationProcess {
    userCtx = {
      dxuser,
      id: userId,
      accessToken: 'secret-token',
      loadEntity: async (): Promise<User> => null,
    }
    return new GroupsSpaceCreationProcess(
      userCtx,
      emMocked,
      spaceNotificationService,
      taggingService,
      adminPlatformClient,
    )
  }

  function privateProcess(dxuser: string, userId: number): PrivateSpaceCreationProcess {
    userCtx = {
      dxuser,
      id: userId,
      accessToken: 'secret-token',
      loadEntity: async (): Promise<User> => null,
    }
    return new PrivateSpaceCreationProcess(
      userCtx,
      emMocked,
      spaceNotificationService,
      taggingService,
      platformClient,
      adminPlatformClient,
    )
  }

  function administratorProcess(dxuser: string, userId: number): AdministratorSpaceCreationProcess {
    userCtx = {
      dxuser,
      id: userId,
      accessToken: 'secret-token',
      loadEntity: async (): Promise<User> => null,
    }
    return new AdministratorSpaceCreationProcess(
      userCtx,
      emMocked,
      spaceNotificationService,
      taggingService,
      platformClient,
      adminPlatformClient,
    )
  }

  function governmentProcess(dxuser: string, userId: number): GovernmentSpaceCreationProcess {
    userCtx = {
      dxuser,
      id: userId,
      accessToken: 'secret-token',
      loadEntity: async (): Promise<User> => null,
    }
    return new GovernmentSpaceCreationProcess(
      userCtx,
      emMocked,
      spaceNotificationService,
      taggingService,
      platformClient,
      adminPlatformClient,
    )
  }
})
