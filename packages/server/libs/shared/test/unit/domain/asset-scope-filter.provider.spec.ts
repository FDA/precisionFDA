import { expect } from 'chai'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { AssetScopeFilterProvider } from '@shared/domain/user-file/service/asset-scope-filter.provider'
import { FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('AssetScopeFilterProvider', () => {
  const USER_ID = 1
  const USER = { id: USER_ID } as unknown as User
  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  const BASE_WHERE = {
    stiType: FILE_STI_TYPE.ASSET,
    state: { $ne: FILE_STATE_PFDA.REMOVING },
  }

  let provider: AssetScopeFilterProvider

  beforeEach(() => {
    provider = new AssetScopeFilterProvider()
  })

  describe('#buildWhereCondition', () => {
    describe('HOME_SCOPE.ME', () => {
      it('should return condition for private assets owned by user with base filters', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          ...BASE_WHERE,
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('HOME_SCOPE.FEATURED', () => {
      it('should return condition for featured public assets with base filters', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          ...BASE_WHERE,
          featured: true,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('HOME_SCOPE.EVERYBODY', () => {
      it('should return condition for all public assets with base filters', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          ...BASE_WHERE,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('HOME_SCOPE.SPACES', () => {
      it('should return condition for assets in accessible spaces with base filters', () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = provider.buildWhereCondition(context)

        expect(result).to.deep.equal({
          ...BASE_WHERE,
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
