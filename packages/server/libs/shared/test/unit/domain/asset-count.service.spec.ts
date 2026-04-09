import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { AssetCountService } from '@shared/domain/user-file/service/asset-count.service'
import { AssetScopeFilterProvider } from '@shared/domain/user-file/service/asset-scope-filter.provider'
import { FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('AssetCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let assetScopeFilterProvider: AssetScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(3)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    assetScopeFilterProvider = new AssetScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should query assets with correct filters for ME scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(3)
        expect(countCalls).to.have.lengthOf(1)
        const assetCall = countCalls[0]
        expect(assetCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.ASSET,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('FEATURED scope', () => {
      it('should query assets with featured filter', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(3)
        const assetCall = countCalls[0]
        expect(assetCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.ASSET,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          featured: true,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('EVERYBODY scope', () => {
      it('should query assets with public scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(3)
        const assetCall = countCalls[0]
        expect(assetCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.ASSET,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('SPACES scope', () => {
      it('should query assets with space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(3)
        const assetCall = countCalls[0]
        expect(assetCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.ASSET,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
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

  function getInstance(): AssetCountService {
    return new AssetCountService(em as unknown as SqlEntityManager, assetScopeFilterProvider)
  }
})
