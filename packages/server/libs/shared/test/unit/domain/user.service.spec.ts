import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/user.service'
import { expert } from '@shared/test/generate'
import { stub } from 'sinon'
import { create, db } from '../../../src/test'
import { expect } from 'chai'

describe('user service tests', () => {
  let em: EntityManager<MySqlDriver>

  let userService: UserService
  const createSendEmailTaskStub = stub()


  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>

    const emailsJobProducer = {
      createSendEmailTask: createSendEmailTaskStub,
    } as unknown as EmailQueueJobProducer

    userService = new UserService(em, emailsJobProducer)
  })

  it('list active user names', async () => {
    create.userHelper.create(em, { dxuser: 'user1', userState: 1, })
    create.userHelper.create(em, { dxuser: 'user2', userState: 0, })
    create.userHelper.create(em, { dxuser: 'user3', userState: 0 })
    await em.flush()

    const result = await userService.listActiveUserNames()
    expect(result.length).eq(3) // one user created for test cases and two in it block
  })

  it('list government user names', async () => {
    create.userHelper.create(em, { dxuser: 'gov-user1', email: 'user1@fda.hhs.gov' })
    create.userHelper.create(em, { dxuser: 'gov-user2', email: 'user2@fda.hhs.gov' })
    create.userHelper.create(em, {
      dxuser: 'non-gov-user',
      email: 'user2@dnanexus.com',
    })

    await em.flush()

    const result = await userService.listGovernmentUserNames()
    expect(result.length).eq(2)
    expect(result[0]).eq('gov-user1')
    expect(result[1]).eq('gov-user2')
  })

  it('send inactivity alerts', async () => {

    const lastLoginDate = new Date()
    // 59 days ago
    lastLoginDate.setDate(lastLoginDate.getDate() - 59)

    create.userHelper.create(em, { dxuser: 'user1', userState: 1, })
    const inactiveUser = create.userHelper.create(em, { dxuser: 'user2', userState: 0, lastLogin: lastLoginDate })
    create.userHelper.create(em, { dxuser: 'user3', userState: 0 })
    await em.flush()

    await userService.sendUserInactivityAlerts()
    expect(createSendEmailTaskStub.callCount).to.equal(1)
    expect(createSendEmailTaskStub.getCall(0).args[0].emailType).to.equal(EMAIL_TYPES.userInactivityAlert)
    expect(createSendEmailTaskStub.getCall(0).args[0].to).to.equal(inactiveUser.email)

    const notifiedUser = await em.findOne(User, { id: inactiveUser.id})
    expect(notifiedUser.extras.inactivity_email_sent).to.equal(true)



  })


})
