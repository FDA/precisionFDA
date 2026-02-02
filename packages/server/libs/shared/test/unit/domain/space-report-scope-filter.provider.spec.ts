import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { SpaceReportScopeFilterProvider } from '@shared/domain/space-report/space-report-scope-filter.provider'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'

describe('SpaceReportScopeFilterProvider', () => {
  const USER_ID = 1
  const USER = { id: USER_ID } as unknown as User
  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let provider: SpaceReportScopeFilterProvider

  beforeEach(() => {
    provider = new SpaceReportScopeFilterProvider()
  })

  describe('#buildWhereCondition', () => {
    describe('HOME_SCOPE.ME', () => {
      it('should return condition for private space reports created by user', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          createdBy: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('HOME_SCOPE.FEATURED', () => {
      it('should return null because space reports do not have featured scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null
      })
    })

    describe('HOME_SCOPE.EVERYBODY', () => {
      it('should return null because space reports do not have public scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null
      })
    })

    describe('HOME_SCOPE.SPACES', () => {
      it('should return null because space reports are not shown in spaces scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null
      })

      it('should return null even when user has accessible spaces', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: [],
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null
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

        expect(result).to.be.null
      })
    })
  })
})
