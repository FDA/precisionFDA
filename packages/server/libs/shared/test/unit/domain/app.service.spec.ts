import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { AppRepository } from '@shared/domain/app/app.repository'
import { AppService } from '@shared/domain/app/services/app.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { ErrorCodes, InvalidStateError, NotFoundError } from '@shared/errors'
import { create, db } from '../../../src/test'

describe('AppService', () => {
  let em: EntityManager<MySqlDriver>
  let appRepository: AppRepository
  let userCtx: UserContext

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    await em.clear()

    const user = create.userHelper.create(em)
    await em.flush()
    appRepository = new AppRepository(em, App)
    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: () => Promise.resolve(user),
    } as UserContext
  })

  context('getValidAccessibleApp', () => {
    it('should throw NotFoundError if app does not exist', async () => {
      const appService = getInstance()
      const fakeUid = 'non-existent-uid' as Uid<'app'>

      await executeTest(async () => {
        try {
          await appService.getValidAccessibleApp(fakeUid)
          expect.fail('Expected NotFoundError to be thrown')
        } catch (error) {
          expect(error).to.be.instanceOf(NotFoundError)
          expect(error.message).to.equal(`App uid: ${fakeUid} not found`)
          expect(error.props.code).to.equal(ErrorCodes.APP_NOT_FOUND)
        }
      })
    })

    it('should throw InvalidStateError if app is deleted', async () => {
      const user = create.userHelper.create(em)
      const app = create.appHelper.createRegular(em, { user })
      app.deleted = true
      await em.persist(app).flush()

      const appService = getInstance()

      await executeTest(async () => {
        await expect(appService.getValidAccessibleApp(app.uid)).to.be.rejectedWith(
          InvalidStateError,
          'App has been invalidated and cannot be run',
        )
      })
    })

    it('should return the app if it exists and is not deleted', async () => {
      const user = create.userHelper.create(em)
      const app = create.appHelper.createRegular(em, { user })
      await em.persist(app).flush()

      await executeTest(async () => {
        const appService = getInstance()
        const result = await appService.getValidAccessibleApp(app.uid)
        expect(result).to.equal(app)
      })
    })
  })

  function getInstance(): AppService {
    return new AppService(appRepository)
  }

  async function executeTest(func: () => void): Promise<void> {
    await userContextStorage.run(userCtx, async () => {
      await func()
    })
  }
})
