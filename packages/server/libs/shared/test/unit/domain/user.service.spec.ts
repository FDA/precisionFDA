import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import sinon, { match, stub } from 'sinon'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { UserService } from '@shared/domain/user/service/user.service'
import { USER_STATE, User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { PlatformClient } from '@shared/platform-client'

describe('user service tests', () => {
  const emFlushStub = sinon.stub()
  const emTransactionalStub = stub()
  const createSendEmailTaskStub = stub()
  const userRepoPaginateStub = stub()
  const userRepoFindActiveStub = stub()
  const userRepoFindStub = stub()
  const userRepoFindOneStub = stub()

  const createUserService = () => {
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
    } as unknown as UserRepository

    emTransactionalStub.callsFake(async callback => {
      return callback(em)
    })

    const platformClient = {} as unknown as PlatformClient
    const adminPlatformClient = {} as unknown as PlatformClient

    return new UserService(
      em,
      {
        id: 42,
        dxuser: 'user1',
        accessToken: 'access_token',
        loadEntity: () => null,
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
})
