import { expect } from 'chai'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { DbClusterScopeFilterProvider } from '@shared/domain/db-cluster/db-cluster-scope-filter.provider'
import { User } from '@shared/domain/user/user.entity'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('DbClusterScopeFilterProvider', () => {
  const USER_ID = 1
  const USER = { id: USER_ID } as unknown as User
  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let provider: DbClusterScopeFilterProvider

  beforeEach(() => {
    provider = new DbClusterScopeFilterProvider()
  })

  describe('#buildWhereCondition', () => {
    describe('HOME_SCOPE.ME', () => {
      it('should return condition for private db clusters owned by user', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('HOME_SCOPE.FEATURED', () => {
      it('should return null because db clusters do not have featured scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null()
      })
    })

    describe('HOME_SCOPE.EVERYBODY', () => {
      it('should return null because db clusters do not have public scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null()
      })
    })

    describe('HOME_SCOPE.SPACES', () => {
      it('should return condition for db clusters in accessible spaces', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          scope: { $in: SPACE_SCOPES },
        })
      })

      it('should return null when user has no accessible spaces', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: [],
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null()
      })
    })

    describe('unknown scope', () => {
      it('should return null for unsupported scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: 'unknown' as HOME_SCOPE,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null()
      })
    })
  })
})
