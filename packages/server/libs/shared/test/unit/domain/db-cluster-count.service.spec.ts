import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { DbClusterScopeFilterProvider } from '@shared/domain/db-cluster/db-cluster-scope-filter.provider'
import { DbClusterCountService } from '@shared/domain/db-cluster/service/db-cluster-count.service'
import { User } from '@shared/domain/user/user.entity'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('DbClusterCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let dbClusterScopeFilterProvider: DbClusterScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(1)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    dbClusterScopeFilterProvider = new DbClusterScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should query db clusters with correct filters for ME scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(1)
        expect(countCalls).to.have.lengthOf(1)
        const dbClusterCall = countCalls[0]
        expect(dbClusterCall.where).to.deep.include({
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('FEATURED scope', () => {
      it('should return 0 for FEATURED scope (db clusters do not have featured)', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(0)
        // Should not make any DB calls
        expect(countCalls).to.have.lengthOf(0)
      })
    })

    describe('EVERYBODY scope', () => {
      it('should return 0 for EVERYBODY scope (db clusters do not have public scope)', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(0)
        // Should not make any DB calls
        expect(countCalls).to.have.lengthOf(0)
      })
    })

    describe('SPACES scope', () => {
      it('should query db clusters with space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(1)
        const dbClusterCall = countCalls[0]
        expect(dbClusterCall.where).to.deep.include({
          scope: { $in: SPACE_SCOPES },
        })
      })

      it('should return 0 when user has no accessible spaces', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(0)
        expect(countCalls).to.have.lengthOf(0)
      })
    })
  })

  function getInstance(): DbClusterCountService {
    return new DbClusterCountService(em as unknown as SqlEntityManager, dbClusterScopeFilterProvider)
  }
})
