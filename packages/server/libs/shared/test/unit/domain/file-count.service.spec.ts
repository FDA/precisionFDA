import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { ScopeFilterContext, SpaceScope } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { FileCountService } from '@shared/domain/user-file/service/file-count.service'
import { FileScopeFilterProvider } from '@shared/domain/user-file/service/file-scope-filter.provider'
import { FILE_STATE_PFDA, FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'

describe('FileCountService', () => {
  const USER_ID = 1

  let emCountStub: SinonStub
  let countCalls: Array<{ entity: string; where: unknown }>

  const USER = {
    id: USER_ID,
  } as unknown as User

  const SPACE_SCOPES: SpaceScope[] = ['space-1', 'space-2']

  let em: { count: SinonStub }
  let fileScopeFilterProvider: FileScopeFilterProvider

  beforeEach(() => {
    countCalls = []

    emCountStub = stub().callsFake((entity: { name: string }, where: unknown) => {
      const entityName = entity.name
      countCalls.push({ entity: entityName, where })
      return Promise.resolve(5)
    })

    em = { count: emCountStub } as unknown as { count: SinonStub }
    fileScopeFilterProvider = new FileScopeFilterProvider()
  })

  describe('#count', () => {
    describe('ME scope', () => {
      it('should query files with correct filters for ME scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(5)
        expect(countCalls).to.have.lengthOf(1)
        const fileCall = countCalls[0]
        expect(fileCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.USERFILE,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          parentType: { $ne: null, $nin: [PARENT_TYPE.COMPARISON] },
          user: USER_ID,
          scope: STATIC_SCOPE.PRIVATE,
        })
      })
    })

    describe('FEATURED scope', () => {
      it('should query files with featured filter', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.FEATURED,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(5)
        const fileCall = countCalls[0]
        expect(fileCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.USERFILE,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          parentType: { $ne: null, $nin: [PARENT_TYPE.COMPARISON] },
          featured: true,
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('EVERYBODY scope', () => {
      it('should query files with public scope', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.EVERYBODY,
          spaceScopes: [],
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(5)
        const fileCall = countCalls[0]
        expect(fileCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.USERFILE,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          parentType: { $ne: null, $nin: [PARENT_TYPE.COMPARISON] },
          scope: STATIC_SCOPE.PUBLIC,
        })
      })
    })

    describe('SPACES scope', () => {
      it('should query files with space scopes', async () => {
        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.SPACES,
          spaceScopes: SPACE_SCOPES,
        }

        const result = await getInstance().count(context)

        expect(result).to.eq(5)
        const fileCall = countCalls[0]
        expect(fileCall.where).to.deep.include({
          stiType: FILE_STI_TYPE.USERFILE,
          state: { $ne: FILE_STATE_PFDA.REMOVING },
          parentType: { $ne: null, $nin: [PARENT_TYPE.COMPARISON] },
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

    describe('error handling', () => {
      it('should propagate error from em.count', async () => {
        const error = new Error('Database error')
        emCountStub.rejects(error)

        const context: ScopeFilterContext = {
          user: USER,
          scope: HOME_SCOPE.ME,
          spaceScopes: [],
        }

        await expect(getInstance().count(context)).to.be.rejectedWith(error)
      })
    })
  })

  function getInstance(): FileCountService {
    return new FileCountService(em as unknown as SqlEntityManager, fileScopeFilterProvider)
  }
})
