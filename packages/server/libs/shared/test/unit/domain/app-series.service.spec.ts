import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '@shared/database'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesRepository } from '@shared/domain/app-series/app-series.repository'
import { AppSeriesCountService } from '@shared/domain/app-series/app-series-count.service'
import { AppSeriesScopeFilterProvider } from '@shared/domain/app-series/app-series-scope-filter.provider'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { create, db } from '../../../src/test'

describe('AppSeriesService', () => {
  let em: EntityManager<MySqlDriver>
  let appSeriesRepository: AppSeriesRepository
  let appSeriesCountService: AppSeriesCountService
  let userCtx: UserContext
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    await em.clear()

    user = create.userHelper.create(em)
    await em.flush()
    appSeriesRepository = new AppSeriesRepository(em, AppSeries)
    appSeriesCountService = new AppSeriesCountService(em, new AppSeriesScopeFilterProvider())
    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: () => Promise.resolve(user),
    } as UserContext
  })

  context('getAppSeriesByName', () => {
    it('should return app series by name, scope and user', async () => {
      const newUser = create.userHelper.create(em)
      const appSeries = create.appSeriesHelper.create(em, { user }, {})
      create.appSeriesHelper.create(em, { user: newUser }, { name: appSeries.name, scope: appSeries.scope })
      create.appSeriesHelper.create(em, { user }, { scope: 'public', name: appSeries.name })
      await em.flush()

      const appSeriesService = getInstance()
      const result = await appSeriesService.getAppSeriesByName(appSeries.name, appSeries.scope)
      expect(result).to.equal(appSeries)
    })
  })

  context('createAppSeries', () => {
    it('should create a new app series', async () => {
      const appSeriesService = getInstance()
      const appName = 'Test App Series'
      const scope = 'private'
      const appSeries = await appSeriesService.createAppSeries(appName, user, scope)

      expect(appSeries).to.be.instanceOf(AppSeries)
      expect(appSeries.name).to.equal(appName)
      expect(appSeries.scope).to.equal(scope)
      expect(appSeries.user?.id).to.equal(user.id)

      const foundAppSeries = await em.findOne(AppSeries, { id: appSeries.id })
      expect(foundAppSeries).to.not.be.null
      expect(foundAppSeries?.name).to.equal(appName)
    })
  })

  function getInstance(): AppSeriesService {
    return new AppSeriesService(userCtx, appSeriesRepository, appSeriesCountService)
  }
})
