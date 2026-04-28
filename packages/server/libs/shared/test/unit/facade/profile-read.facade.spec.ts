import { Ref } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { Organization } from '@shared/domain/org/organization.entity'
import { ProfileService } from '@shared/domain/profile/service/profile.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { ProfileReadFacade } from '@shared/facade/profile/profile-read.facade'

describe('ProfileReadFacade', () => {
  const populateStub = stub()
  const userServiceGetUsersInOrganizationStub = stub()
  const loadEntityStub = stub()
  const getProfileViewFieldsStub = stub()

  const em = {
    populate: populateStub,
  } as unknown as EntityManager

  const userCtx = {
    loadEntity: loadEntityStub,
  } as unknown as UserContext

  const profileService = {
    getProfileViewFields: getProfileViewFieldsStub,
  } as unknown as ProfileService

  const userService = {
    getUsersInOrganization: userServiceGetUsersInOrganizationStub,
  } as unknown as UserService

  beforeEach(() => {
    populateStub.reset()
    populateStub.resolves()
    loadEntityStub.reset()
    userServiceGetUsersInOrganizationStub.reset()
    getProfileViewFieldsStub.reset()
  })

  function getInstance(): ProfileReadFacade {
    return new ProfileReadFacade(em, userCtx, profileService, userService)
  }

  describe('#getProfilePage', () => {
    it('returns profile page for org admin', async () => {
      const adminUser = {
        id: 1,
        dxuser: 'admin.user',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        fullName: 'Admin User',
        timeZone: 'US/Eastern',
        organization: {
          getEntity: (): Organization =>
            ({
              id: 10,
              handle: 'test-org',
              name: 'Test Org',
              singular: false,
              admin: {
                id: 1,
                getEntity: (): User =>
                  ({
                    id: 1,
                    firstName: 'Admin',
                    lastName: 'User',
                  }) as unknown as User,
              } as unknown as Ref<User>,
            }) as unknown as Organization,
        },
      }

      loadEntityStub.resolves(adminUser)
      getProfileViewFieldsStub.resolves({ emailConfirmed: true, email: 'admin@example.com' })

      const facade = getInstance()
      const result = await facade.getProfilePage()

      expect(result.user.id).to.equal(1)
      expect(result.user.isOrgAdmin).to.equal(true)
      expect(result.user.canProvisionAccounts).to.equal(true)
      expect(result.user.singular).to.equal(false)
      expect(result.organization).to.not.be.null()
      if (result.organization == null) {
        throw new Error('Organization is expected for non-singular profile')
      }
      expect(result.organization.handle).to.equal('test-org')
      expect(result.organization.adminFullName).to.equal('Admin User')
    })

    it('returns profile page for non-admin member', async () => {
      const memberUser = {
        id: 2,
        dxuser: 'member.user',
        firstName: 'Member',
        lastName: 'User',
        email: 'member@example.com',
        fullName: 'Member User',
        timeZone: null,
        organization: {
          getEntity: (): Organization =>
            ({
              id: 10,
              handle: 'test-org',
              name: 'Test Org',
              singular: false,
              admin: {
                id: 1,
                getEntity: (): User =>
                  ({
                    id: 1,
                    firstName: 'Admin',
                    lastName: 'User',
                  }) as unknown as User,
              } as unknown as Ref<User>,
            }) as unknown as Organization,
        },
      }

      loadEntityStub.resolves(memberUser)
      getProfileViewFieldsStub.resolves({ emailConfirmed: true, email: 'member@example.com' })

      const facade = getInstance()
      const result = await facade.getProfilePage()

      expect(result.user.isOrgAdmin).to.equal(false)
      expect(result.user.canProvisionAccounts).to.equal(false)
      expect(result.organization).to.not.be.null()
    })

    it('returns null organization for singular user', async () => {
      const singularUser = {
        id: 3,
        dxuser: 'solo.user',
        firstName: 'Solo',
        lastName: 'User',
        email: 'solo@example.com',
        fullName: 'Solo User',
        timeZone: null,
        organization: {
          getEntity: (): Organization =>
            ({
              id: 20,
              handle: 'solo-org',
              name: 'Solo Org',
              singular: true,
              admin: undefined,
            }) as unknown as Organization,
        },
      }

      loadEntityStub.resolves(singularUser)
      getProfileViewFieldsStub.resolves({ emailConfirmed: false, email: 'solo@example.com' })

      const facade = getInstance()
      const result = await facade.getProfilePage()

      expect(result.user.singular).to.equal(true)
      expect(result.user.isOrgAdmin).to.equal(false)
      expect(result.user.canProvisionAccounts).to.equal(false)
      expect(result.organization).to.be.null()
    })
  })

  describe('#getOrganizationUsers', () => {
    it('returns only self for singular org', async () => {
      const singularUser = {
        id: 3,
        dxuser: 'solo.user',
        fullName: 'Solo User',
        createdAt: new Date('2024-01-15'),
        userState: USER_STATE.ENABLED,
        organization: {
          getEntity: (): Organization => ({ id: 20, singular: true }) as unknown as Organization,
        },
      }

      loadEntityStub.resolves(singularUser)

      const facade = getInstance()
      const result = await facade.getOrganizationUsers()

      expect(result.totalCount).to.equal(1)
      expect(result.users).to.have.length(1)
      expect(result.users[0].id).to.equal(3)
      expect(result.users[0].isAdmin).to.equal(false)
      expect(result.users[0].isEnabled).to.equal(true)
      expect(userServiceGetUsersInOrganizationStub.called).to.equal(false)
    })

    it('returns all org users for non-singular org', async () => {
      const adminUser = {
        id: 1,
        dxuser: 'admin.user',
        fullName: 'Admin User',
        createdAt: new Date('2024-01-10'),
        userState: USER_STATE.ENABLED,
        organization: {
          getEntity: (): Organization =>
            ({ id: 10, singular: false, admin: { id: 1 } as Ref<User> }) as unknown as Organization,
        },
      }

      const orgUsers = [
        {
          id: 1,
          dxuser: 'admin.user',
          fullName: 'Admin User',
          createdAt: new Date('2024-01-10'),
          userState: USER_STATE.ENABLED,
        },
        {
          id: 2,
          dxuser: 'member.user',
          fullName: 'Member User',
          createdAt: new Date('2024-02-20'),
          userState: USER_STATE.DEACTIVATED,
        },
      ]

      loadEntityStub.resolves(adminUser)
      userServiceGetUsersInOrganizationStub.resolves(orgUsers)

      const facade = getInstance()
      const result = await facade.getOrganizationUsers()

      expect(result.totalCount).to.equal(2)
      expect(result.users[0].isAdmin).to.equal(true)
      expect(result.users[0].isEnabled).to.equal(true)
      expect(result.users[1].isAdmin).to.equal(false)
      expect(result.users[1].isEnabled).to.equal(false)
    })
  })
})
