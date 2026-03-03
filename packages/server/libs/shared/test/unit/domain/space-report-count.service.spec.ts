import { SqlEntityManager } from '@mikro-orm/mysql'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'
import { SpaceReportCountService } from '@shared/domain/space-report/service/space-report-count.service'
import { SpaceReportScopeFilterProvider } from '@shared/domain/space-report/space-report-scope-filter.provider'

describe('SpaceReportCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let spaceReportScopeFilterProvider: SpaceReportScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(6)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    spaceReportScopeFilterProvider = new SpaceReportScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should query space reports with correct filters for ME scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(6)
        expect(countCalls).to.have.lengthOf(1)
        const reportCall = countCalls[0]
        expect(reportCall.where).to.deep.include({
          createdBy: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('FEATURED scope', () => {
      it('should return 0 for FEATURED scope (space reports do not have featured)', async () => {
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
      it('should return 0 for EVERYBODY scope (space reports do not have public scope)', async () => {
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
      it('should query space reports filtered by space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(6)
        expect(countCalls).to.have.lengthOf(1)
        const reportCall = countCalls[0]
        expect(reportCall.where).to.deep.include({
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

  function getInstance(): SpaceReportCountService {
    return new SpaceReportCountService(
      em as unknown as SqlEntityManager,
      spaceReportScopeFilterProvider,
    )
  }
})
