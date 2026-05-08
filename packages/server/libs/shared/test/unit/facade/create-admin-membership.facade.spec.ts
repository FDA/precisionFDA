import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { CreateAdminMembershipDTO } from '@shared/domain/admin-membership/dto/create-admin-membership.dto'
import { AdminMembershipService } from '@shared/domain/admin-membership/service/admin-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError } from '@shared/errors'
import { CreateAdminMembershipFacade } from '@shared/facade/admin-membership/create-admin-membership.facade'
import { PlatformClient } from '@shared/platform-client'

describe('CreateAdminMembershipFacade', () => {
  const transactionalStub = stub()
  const getUserByIdStub = stub()
  const findAdminGroupOrFailStub = stub()
  const createRecordStub = stub()
  const findAdminSpacesStub = stub()
  const activateOrCreateStub = stub()
  const inviteUserToOrgStub = stub()
  const projectInviteStub = stub()

  const em = {
    transactional: transactionalStub,
  } as unknown as SqlEntityManager

  const adminMembershipService = {
    findAdminGroupOrFail: findAdminGroupOrFailStub,
    createRecord: createRecordStub,
  } as unknown as AdminMembershipService

  const userService = {
    getUserById: getUserByIdStub,
  } as unknown as UserService

  const spaceService = {
    findAdminSpaces: findAdminSpacesStub,
  } as unknown as SpaceService

  const spaceMembershipService = {
    activateOrCreateAdminSpaceMembership: activateOrCreateStub,
  } as unknown as SpaceMembershipService

  const adminClient = {
    inviteUserToOrganization: inviteUserToOrgStub,
    projectInvite: projectInviteStub,
  } as unknown as PlatformClient

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.callsFake(async (callback: () => Promise<unknown>) => callback())

    getUserByIdStub.reset()
    getUserByIdStub.throws()

    findAdminGroupOrFailStub.reset()
    findAdminGroupOrFailStub.throws()

    createRecordStub.reset()
    createRecordStub.throws()

    findAdminSpacesStub.reset()
    findAdminSpacesStub.throws()

    activateOrCreateStub.reset()
    activateOrCreateStub.throws()

    inviteUserToOrgStub.reset()
    inviteUserToOrgStub.throws()

    projectInviteStub.reset()
    projectInviteStub.throws()
  })

  function getInstance(): CreateAdminMembershipFacade {
    return new CreateAdminMembershipFacade(
      em,
      adminMembershipService,
      userService,
      spaceService,
      spaceMembershipService,
      adminClient,
    )
  }

  describe('#createMembership', () => {
    it('creates membership for non-site-admin role without org/space operations', async () => {
      const user = { id: 1, dxuser: 'test-user' } as unknown as User
      const adminGroup = { role: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN }
      const membership = { id: 42 }
      const dto: CreateAdminMembershipDTO = { userId: 1, group: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN }

      getUserByIdStub.withArgs(1).resolves(user)
      findAdminGroupOrFailStub.withArgs(ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN).resolves(adminGroup)
      createRecordStub.withArgs(user, adminGroup).resolves(membership)

      const facade = getInstance()
      const result = await facade.createMembership(dto)

      expect(result).to.deep.equal({ id: 42 })
      expect(inviteUserToOrgStub.callCount).to.equal(0)
      expect(findAdminSpacesStub.callCount).to.equal(0)
      expect(projectInviteStub.callCount).to.equal(0)
    })

    it('creates membership for ROLE_SITE_ADMIN and invites user to org and spaces', async () => {
      const user = { id: 2, dxuser: 'site-admin-user' } as unknown as User
      const adminGroup = { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }
      const membership = { id: 99 }
      const space1 = { id: 10, hostProject: 'project-AAA' }
      const space2 = { id: 11, hostProject: 'project-BBB' }
      const dto: CreateAdminMembershipDTO = { userId: 2, group: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }

      getUserByIdStub.withArgs(2).resolves(user)
      findAdminGroupOrFailStub.withArgs(ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN).resolves(adminGroup)
      createRecordStub.withArgs(user, adminGroup).resolves(membership)
      inviteUserToOrgStub.resolves()
      findAdminSpacesStub.resolves([space1, space2])
      activateOrCreateStub.resolves()
      projectInviteStub.resolves()

      const facade = getInstance()
      const result = await facade.createMembership(dto)

      expect(result).to.deep.equal({ id: 99 })
      expect(inviteUserToOrgStub.calledOnce).to.be.true()
      expect(inviteUserToOrgStub.getCall(0).args[0]).to.deep.include({
        orgDxId: config.platform.pfdaAdminOrg,
      })
      expect(activateOrCreateStub.callCount).to.equal(2)
      expect(activateOrCreateStub.getCall(0).args).to.deep.equal([user, space1])
      expect(activateOrCreateStub.getCall(1).args).to.deep.equal([user, space2])
      expect(projectInviteStub.callCount).to.equal(2)
      expect(projectInviteStub.getCall(0).args).to.deep.equal([space1.hostProject, `user-${user.dxuser}`, 'ADMINISTER'])
      expect(projectInviteStub.getCall(1).args).to.deep.equal([space2.hostProject, `user-${user.dxuser}`, 'ADMINISTER'])
    })

    it('creates ROLE_SITE_ADMIN membership and skips projectInvite for space without hostProject', async () => {
      const user = { id: 3, dxuser: 'admin-no-project' } as unknown as User
      const adminGroup = { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }
      const membership = { id: 55 }
      const spaceWithProject = { id: 20, hostProject: 'project-CCC' }
      const spaceWithoutProject = { id: 21, hostProject: null }
      const dto: CreateAdminMembershipDTO = { userId: 3, group: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }

      getUserByIdStub.withArgs(3).resolves(user)
      findAdminGroupOrFailStub.withArgs(ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN).resolves(adminGroup)
      createRecordStub.withArgs(user, adminGroup).resolves(membership)
      inviteUserToOrgStub.resolves()
      findAdminSpacesStub.resolves([spaceWithProject, spaceWithoutProject])
      activateOrCreateStub.resolves()
      projectInviteStub.resolves()

      const facade = getInstance()
      await facade.createMembership(dto)

      expect(activateOrCreateStub.callCount).to.equal(2)
      expect(projectInviteStub.callCount).to.equal(1)
      expect(projectInviteStub.getCall(0).args[0]).to.equal(spaceWithProject.hostProject)
    })

    it('throws InvalidStateError when user is not found', async () => {
      const dto: CreateAdminMembershipDTO = { userId: 999, group: ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN }

      getUserByIdStub.withArgs(999).resolves(null)

      const facade = getInstance()
      await expect(facade.createMembership(dto)).to.be.rejectedWith(InvalidStateError, 'User with id 999 not found')
    })

    it('creates ROLE_SITE_ADMIN membership with no admin spaces and only invites to org', async () => {
      const user = { id: 4, dxuser: 'lonely-admin' } as unknown as User
      const adminGroup = { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }
      const membership = { id: 77 }
      const dto: CreateAdminMembershipDTO = { userId: 4, group: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN }

      getUserByIdStub.withArgs(4).resolves(user)
      findAdminGroupOrFailStub.withArgs(ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN).resolves(adminGroup)
      createRecordStub.withArgs(user, adminGroup).resolves(membership)
      inviteUserToOrgStub.resolves()
      findAdminSpacesStub.resolves([])

      const facade = getInstance()
      const result = await facade.createMembership(dto)

      expect(result).to.deep.equal({ id: 77 })
      expect(inviteUserToOrgStub.calledOnce).to.be.true()
      expect(activateOrCreateStub.callCount).to.equal(0)
      expect(projectInviteStub.callCount).to.equal(0)
    })
  })
})
