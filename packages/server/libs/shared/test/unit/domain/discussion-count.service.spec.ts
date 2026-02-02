import { SqlEntityManager } from '@mikro-orm/mysql'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'
import { DiscussionCountService } from '@shared/domain/discussion/services/discussion-count.service'
import { DiscussionScopeFilterProvider } from '@shared/domain/discussion/discussion-scope-filter.provider'

describe('DiscussionCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let discussionScopeFilterProvider: DiscussionScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(7)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    discussionScopeFilterProvider = new DiscussionScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should return 0 for ME scope (discussions do not have a "me" scope)', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(0)
        // Should not make any DB calls
        expect(countCalls).to.have.lengthOf(0)
      })
    })

    describe('FEATURED scope', () => {
      it('should query discussions with public scope for FEATURED', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(7)
        expect(countCalls).to.have.lengthOf(1)
        const discussionCall = countCalls[0]
        expect(discussionCall.where).to.deep.equal({
          note: { scope: STATIC_SCOPE.PUBLIC },
        })
      })
    })

    describe('EVERYBODY scope', () => {
      it('should query discussions with public scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(7)
        const discussionCall = countCalls[0]
        expect(discussionCall.where).to.deep.equal({
          note: { scope: STATIC_SCOPE.PUBLIC },
        })
      })
    })

    describe('SPACES scope', () => {
      it('should query discussions with space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(7)
        const discussionCall = countCalls[0]
        expect(discussionCall.where).to.deep.equal({
          note: { scope: { $in: SPACE_SCOPES } },
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

  function getInstance(): DiscussionCountService {
    return new DiscussionCountService(
      em as unknown as SqlEntityManager,
      discussionScopeFilterProvider,
    )
  }
})
