import { SqlEntityManager } from '@mikro-orm/mysql'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'
import { WorkflowCountService } from '@shared/domain/workflow/service/workflow-count.service'
import { WorkflowScopeFilterProvider } from '@shared/domain/workflow/workflow-scope-filter.provider'

describe('WorkflowCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let workflowScopeFilterProvider: WorkflowScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(4)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    workflowScopeFilterProvider = new WorkflowScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should query workflows with correct filters for ME scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(4)
        expect(countCalls).to.have.lengthOf(1)
        const workflowCall = countCalls[0]
        expect(workflowCall.where).to.deep.include({
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('FEATURED scope', () => {
      it('should query workflows with featured filter', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(4)
        const workflowCall = countCalls[0]
        expect(workflowCall.where).to.deep.include({
          featured: true,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('EVERYBODY scope', () => {
      it('should query workflows with public scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(4)
        const workflowCall = countCalls[0]
        expect(workflowCall.where).to.deep.include({
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('SPACES scope', () => {
      it('should query workflows with space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(4)
        const workflowCall = countCalls[0]
        expect(workflowCall.where).to.deep.include({
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

  function getInstance(): WorkflowCountService {
    return new WorkflowCountService(em as unknown as SqlEntityManager, workflowScopeFilterProvider)
  }
})
