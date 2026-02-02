import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { DiscussionScopeFilterProvider } from '@shared/domain/discussion/discussion-scope-filter.provider'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'

describe('DiscussionScopeFilterProvider', () => {
  const USER_ID = 1
  const USER = { id: USER_ID } as unknown as User
  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let provider: DiscussionScopeFilterProvider

  beforeEach(() => {
    provider = new DiscussionScopeFilterProvider()
  })

  describe('#buildWhereCondition', () => {
    describe('HOME_SCOPE.ME', () => {
      it('should return null because discussions do not have ME scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.be.null
      })
    })

    describe('HOME_SCOPE.FEATURED', () => {
      it('should return condition for public discussions via note scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          note: { scope: STATIC_SCOPE.PUBLIC },
        })
      })
    })

    describe('HOME_SCOPE.EVERYBODY', () => {
      it('should return condition for all public discussions via note scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          note: { scope: STATIC_SCOPE.PUBLIC },
        })
      })
    })

    describe('HOME_SCOPE.SPACES', () => {
      it('should return condition for discussions in accessible spaces via note scope', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          note: { scope: { $in: SPACE_SCOPES } },
        })
      })

      it('should return null when user has no accessible spaces', () => {
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
