import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { populate } from 'dotenv'
import sinon, { match, stub } from 'sinon'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { Organization } from '@shared/domain/org/organization.entity'
import { AdminUserDetailsDTO } from '@shared/domain/user/dto/admin-user-details.dto'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { UserService } from '@shared/domain/user/service/user.service'
import { USER_STATE, User } from '@shared/domain/user/user.entity'
import { USER_ERRORS } from '@shared/domain/user/user.errors'
import { UserRepository } from '@shared/domain/user/user.repository'
import { InvalidStateError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'

describe('user service tests', () => {
  const emFlushStub = sinon.stub()
  const emTransactionalStub = stub()
  const createSendEmailTaskStub = stub()
  const userRepoPaginateStub = stub()
  const userRepoFindActiveStub = stub()
  const userRepoFindStub = stub()
  const userRepoFindOneStub = stub()
  const userRepoPopulateStub = stub()
  const userCloudResourcesStub = stub()
  const userRepoFindOneOrFailStub = stub()
  const platformClientGetSSOIdStub = stub()

  const USER_ID = 42
  const USER_DXUSER = 'user1'
  const USER_ORG = {
    id: 1,
    handle: USER_DXUSER,
    getDxOrg: () => `org-pfda..${USER_DXUSER}`,
  } as unknown as Organization
  const USER = {
    id: USER_ID,
    dxuser: USER_DXUSER,
    organization: {
      load: async () => USER_ORG,
    },
    cloudResourceSettings: {
      total_limit: 100,
      job_limit: 10,
      charges_baseline: {
        computeCharges: 38,
        storageCharges: 1.39,
        dataEgressCharges: 1.79,
      },
    },
  } as unknown as User
  const createUserService = (): UserService => {
    const em = {
      transactional: emTransactionalStub,
      flush: emFlushStub,
    } as unknown as EntityManager<MySqlDriver>

    const emailsJobProducer = {
      createSendEmailTask: createSendEmailTaskStub,
    } as unknown as EmailQueueJobProducer

    const userRepo = {
      paginate: userRepoPaginateStub,
      findActive: userRepoFindActiveStub,
      find: userRepoFindStub,
      findOne: userRepoFindOneStub,
      findOneOrFail: userRepoFindOneOrFailStub,
      populate: userRepoPopulateStub,
    } as unknown as UserRepository

    emTransactionalStub.callsFake(async callback => {
      return callback(em)
    })

    const platformClient = {
      getSSOId: platformClientGetSSOIdStub,
      userCloudResources: userCloudResourcesStub,
    } as unknown as PlatformClient
    const adminPlatformClient = {} as unknown as PlatformClient

    return new UserService(
      em,
      {
        id: USER_ID,
        dxuser: USER_DXUSER,
        accessToken: 'access_token',
        loadEntity: async (): Promise<User> => USER,
      },
      userRepo,
      emailsJobProducer,
      platformClient,
      adminPlatformClient,
    )
  }

  beforeEach(async () => {
    createSendEmailTaskStub.reset()
    createSendEmailTaskStub.throws()

    userRepoPaginateStub.reset()
    userRepoPaginateStub.throws()

    userRepoFindActiveStub.reset()
    userRepoFindActiveStub.throws()

    userRepoFindStub.reset()
    userRepoFindStub.throws()

    userCloudResourcesStub.reset()
    userCloudResourcesStub.throws()
  })

  describe('#listActiveUserNames', () => {
    it('basic', async () => {
      userRepoFindActiveStub.resolves([{ dxuser: 'user1' }, { dxuser: 'user2' }, { dxuser: 'user3' }])

      const userService = createUserService()
      const result = await userService.listActiveUserNames()
      expect(result.length).eq(3)
      expect(result[0]).eq('user1')
      expect(result[1]).eq('user2')
      expect(result[2]).eq('user3')
    })
  })

  describe('#listGovernmentUserNames', () => {
    it('list government user names', async () => {
      userRepoFindStub
        .withArgs({
          $and: [{ userState: 0 }, { $or: [{ email: { $like: '%fda.hhs.gov' } }, { email: { $like: '%fda.gov' } }] }],
        })
        .resolves([
          { dxuser: 'gov-user1', email: 'user1@fda.hhs.gov' },
          { dxuser: 'gov-user2', email: 'user2@fda.hhs.gov' },
        ])

      const userService = createUserService()
      const result = await userService.listGovernmentUserNames()

      expect(result.length).eq(2)
      expect(result[0]).eq('gov-user1')
      expect(result[1]).eq('gov-user2')
    })
  })

  describe('#sendUserInactivityAlerts', () => {
    it('send inactivity alerts', async () => {
      const soonToBeLockedUser = {
        id: 1,
        lastLogin: new Date('2024-11-10'),
        userState: USER_STATE.ENABLED,
        extras: { inactivity_email_sent: false },
      } as User

      userRepoFindStub
        .withArgs(
          match({
            lastLogin: match({
              $ne: null,
              $lt: match.date, // Accept any date
            }),
            privateFilesProject: { $ne: null },
            userState: USER_STATE.ENABLED,
          }),
        )
        .resolves([soonToBeLockedUser])
      createSendEmailTaskStub.reset()

      const userService = createUserService()
      await userService.sendUserInactivityAlerts()

      expect(createSendEmailTaskStub.callCount).to.equal(1)
      expect(createSendEmailTaskStub.getCall(0).args[0].emailType).to.equal(EMAIL_TYPES.userInactivityAlert)
      expect(soonToBeLockedUser.extras.inactivity_email_sent).to.equal(true)
    })
  })

  describe('#paginateUsers', () => {
    it('should paginate users by dxuser filter', async () => {
      userRepoPaginateStub.reset()
      const query = new UserPaginationDto()
      query.filter = {
        dxuser: 'user1',
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      const expectedFilter = {
        $like: '%user1%',
      }

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].dxuser).to.deep.equal(expectedFilter)
    })

    it('should paginate users by email filter', async () => {
      userRepoPaginateStub.reset()
      const query = new UserPaginationDto()
      query.filter = {
        email: 'user2@example.com',
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      const expectedFilter = {
        $like: '%user2@example.com%',
      }

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].email).to.deep.equal(expectedFilter)
    })

    it('should paginate users by last login date range', async () => {
      userRepoPaginateStub.reset()
      const lastLoginDate = new Date()
      // 59 days ago
      lastLoginDate.setDate(lastLoginDate.getDate() - 59)

      const query = new UserPaginationDto()
      query.filter = {
        lastLogin: '2024-11-01T00:00,2024-12-31T23:59',
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      const [startDate, endDate] = query.filter.lastLogin.split(',').map(dateStr => new Date(dateStr))
      const expectedFilter = {
        $gte: new Date(startDate.toISOString()),
        $lte: new Date(endDate.toISOString()),
      }

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].lastLogin).to.deep.equal(expectedFilter)
    })

    it('should paginate users by user state filter', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.filter = {
        userState: 1,
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].userState).to.equal(1)
    })

    it('should paginate users by total limit range filter', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.filter = {
        totalLimit: '10,20',
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].cloudResourceSettings.total_limit).to.deep.equal({
        $gte: 10,
        $lte: 20,
      })
    })

    it('should paginate users by job limit range filter', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.filter = {
        jobLimit: '5,10',
      }
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[1].cloudResourceSettings.job_limit).to.deep.equal({
        $gte: 5,
        $lte: 10,
      })
    })

    it('should order users by total limit in ascending order', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.orderDir = 'ASC'
      query.orderBy = 'totalLimit'
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[2].orderBy).to.deep.equal({
        cloudResourceSettings: { total_limit: 'ASC' },
      })
    })

    it('should order users by job limit in descending order', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.orderDir = 'DESC'
      query.orderBy = 'jobLimit'
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[2].orderBy).to.deep.equal({
        cloudResourceSettings: { job_limit: 'DESC' },
      })
    })

    it('should order users by dxuser in ascending order', async () => {
      userRepoPaginateStub.reset()

      const query = new UserPaginationDto()
      query.orderDir = 'ASC'
      query.orderBy = 'dxuser'
      query.page = 1
      query.pageSize = 10

      const userService = createUserService()
      await userService.paginateUsers(query)

      expect(userRepoPaginateStub.callCount).to.equal(1)
      expect(userRepoPaginateStub.getCall(0).args[0]).to.deep.equal(query)
      expect(userRepoPaginateStub.getCall(0).args[2].orderBy).to.deep.equal({
        dxuser: 'ASC',
      })
    })
  })

  describe('#getUserInOrganization', () => {
    it('delegates to userRepo.findOne with id and organization constraints', async () => {
      const foundUser = { id: 7, dxuser: 'member.user' }
      userRepoFindOneStub.reset()
      userRepoFindOneStub.withArgs({ id: 7, organization: 10 }).resolves(foundUser)

      const userService = createUserService()
      const result = await userService.getUserInOrganization(7, 10)

      expect(userRepoFindOneStub.calledOnceWithExactly({ id: 7, organization: 10 })).to.equal(true)
      expect(result).to.equal(foundUser)
    })
  })

  describe('#getUsersInOrganization', () => {
    it('delegates to userRepo.find with organization filter and dxuser ASC ordering', async () => {
      const orgUsers = [
        { id: 1, dxuser: 'alpha.user' },
        { id: 2, dxuser: 'beta.user' },
      ]
      userRepoFindStub.reset()
      userRepoFindStub.withArgs({ organization: 10 }, { orderBy: { dxuser: 'ASC' } }).resolves(orgUsers)

      const userService = createUserService()
      const result = await userService.getUsersInOrganization(10)

      expect(userRepoFindStub.calledOnceWithExactly({ organization: 10 }, { orderBy: { dxuser: 'ASC' } })).to.equal(
        true,
      )
      expect(result).to.equal(orgUsers)
    })
  })

  describe('#getUserDetailsById by Admin', () => {
    const buildUser = (extras: { sso_enabled: boolean | null }): User =>
      ({
        id: 99,
        dxuser: 'sso.user',
        dxid: 'user-sso.user',
        firstName: 'Sso',
        lastName: 'User',
        fullName: 'Sso User',
        email: 'sso.user@example.com',
        userState: USER_STATE.ENABLED,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        lastLogin: null,
        timeZone: null,
        disableMessage: null,
        cloudResourceSettings: null,
        privateFilesProject: 'project-x',
        extras,
        organization: {
          getEntity: () => ({
            id: 1,
            name: 'Org',
            handle: 'org',
            singular: false,
            admin: null,
          }),
        },
        adminMemberships: {
          getItems: () => [],
        },
        isGovUser: () => false,
      }) as unknown as User

    beforeEach(() => {
      userRepoFindOneOrFailStub.reset()
      userRepoPopulateStub.reset()
      emFlushStub.reset()
      platformClientGetSSOIdStub.reset()
      userRepoPopulateStub.resolves(undefined)
      emFlushStub.resolves(undefined)
    })

    it('lazy-backfills sso_enabled when null and persists', async () => {
      const user = buildUser({ sso_enabled: null })
      userRepoFindOneStub.resolves(user)
      platformClientGetSSOIdStub.resolves({ SSOId: 'idp-okta-123' })

      const userService = createUserService()
      const dto = (await userService.getUserDetailsById(99, true)) as AdminUserDetailsDTO

      expect(platformClientGetSSOIdStub.calledOnceWithExactly({ id: 'user-sso.user' })).to.equal(true)
      expect(user.extras?.sso_enabled).to.equal(true)
      expect(emFlushStub.callCount).to.equal(1)
      expect(dto.isSSO).to.equal(true)
    })

    it('records non-SSO users when platform returns empty SSOId', async () => {
      const user = buildUser({ sso_enabled: null })
      userRepoFindOneStub.resolves(user)
      platformClientGetSSOIdStub.resolves({ SSOId: '' })

      const userService = createUserService()
      const dto = (await userService.getUserDetailsById(99, true)) as AdminUserDetailsDTO

      expect(user.extras?.sso_enabled).to.equal(false)
      expect(emFlushStub.callCount).to.equal(1)
      expect(dto.isSSO).to.equal(false)
    })

    it('skips platform call when sso_enabled is already set', async () => {
      const user = buildUser({ sso_enabled: false })
      userRepoFindOneStub.resolves(user)

      const userService = createUserService()
      const dto = (await userService.getUserDetailsById(99, true)) as AdminUserDetailsDTO

      expect(platformClientGetSSOIdStub.callCount).to.equal(0)
      expect(emFlushStub.callCount).to.equal(0)
      expect(dto.isSSO).to.equal(false)
    })

    it('swallows platform errors and leaves sso_enabled untouched', async () => {
      const user = buildUser({ sso_enabled: null })
      userRepoFindOneStub.resolves(user)
      platformClientGetSSOIdStub.rejects(new Error('platform unavailable'))

      const userService = createUserService()
      const dto = (await userService.getUserDetailsById(99, true)) as AdminUserDetailsDTO

      expect(user.extras?.sso_enabled).to.equal(null)
      expect(emFlushStub.callCount).to.equal(0)
      expect(dto.isSSO).to.equal(false)
    })
  })

  describe('#getCloudResources', () => {
    it('should get cloud resources for user', async () => {
      userCloudResourcesStub.withArgs(USER_ORG.getDxOrg()).resolves({
        computeCharges: 50,
        storageCharges: 20,
        dataEgressCharges: 10,
      })

      const userService = createUserService()
      const result = await userService.getCloudResources()
      const computeCharges = Math.max(50 - USER.cloudResourceSettings.charges_baseline.computeCharges, 0)
      const storageCharges = Math.max(20 - USER.cloudResourceSettings.charges_baseline.storageCharges, 0)
      const dataEgressCharges = Math.max(10 - USER.cloudResourceSettings.charges_baseline.dataEgressCharges, 0)
      const totalCharges = computeCharges + storageCharges + dataEgressCharges

      expect(userCloudResourcesStub.callCount).to.equal(1)
      expect(result.computeCharges).to.equal(computeCharges)
      expect(result.storageCharges).to.equal(storageCharges)
      expect(result.dataEgressCharges).to.equal(dataEgressCharges)
      expect(result.totalCharges).to.equal(totalCharges)
      expect(result.usageLimit).to.equal(USER.cloudResourceSettings.total_limit)
      expect(result.jobLimit).to.equal(USER.cloudResourceSettings.job_limit)
      expect(result.usageAvailable).to.equal(USER.cloudResourceSettings.total_limit - totalCharges)
    })
  })

  describe('#checkTotalChargesLimit', () => {
    it('should throw an error if user has exceeded total charges limit', async () => {
      userCloudResourcesStub.withArgs(USER_ORG.getDxOrg()).resolves({
        computeCharges: 100,
        storageCharges: 50,
        dataEgressCharges: 10,
      })

      const userService = createUserService()
      await expect(userService.checkTotalChargesLimit()).to.be.rejectedWith(
        InvalidStateError,
        USER_ERRORS.CHARGES_LIMIT_EXCEEDED,
      )
    })
  })
})
