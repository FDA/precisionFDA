import { expect } from 'chai'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { WorkflowSeriesScopeFilterProvider } from '@shared/domain/workflow-series/workflow-series-scope-filter.provider'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('WorkflowSeriesScopeFilterProvider', () => {
  const USER_ID = 1
  const USER = { id: USER_ID } as unknown as User
  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let provider: WorkflowSeriesScopeFilterProvider

  beforeEach(() => {
    provider = new WorkflowSeriesScopeFilterProvider()
  })

  describe('#buildWhereCondition', () => {
    describe('HOME_SCOPE.ME', () => {
      it('should return condition for private workflow series owned by user (excluding deleted)', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          deleted: false,
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('HOME_SCOPE.FEATURED', () => {
      it('should return condition for featured public workflow series (excluding deleted)', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          deleted: false,
          featured: true,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('HOME_SCOPE.EVERYBODY', () => {
      it('should return condition for all public workflow series (excluding deleted)', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          deleted: false,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('HOME_SCOPE.SPACES', () => {
      it('should return condition for workflow series in accessible spaces (excluding deleted)', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          deleted: false,
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
