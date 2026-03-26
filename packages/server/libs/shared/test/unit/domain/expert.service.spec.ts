import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { ExpertRepository } from '@shared/domain/expert/repository/expert.repository'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db } from '../../../src/test'
import { ExpertService } from '@shared/domain/expert/services/expert.service'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { ExpertPaginationDTO } from '@shared/domain/expert/dto/expert-pagination.dto'
import { STATIC_SCOPE } from '@shared/enums'
import { UserContext } from '@shared/domain/user-context/model/user-context'

describe('ExpertService tests', () => {
  let em: EntityManager<MySqlDriver>
  let siteAdmin: User
  let userCtx: UserContext
  let expertService: ExpertService
  let user1: User, user2: User, user3: User
  let exp1: Expert, exp2: Expert, exp3: Expert

  const nodesRemoveStub = stub().throws()
  const paginateStub = stub().throws()
  const findOneExpertStub = stub().throws()
  const findOneFileStub = stub().throws()
  const searchByMetaStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    siteAdmin = create.userHelper.createSiteAdmin(em)
    await em.flush()
    userCtx = { id: siteAdmin.id, dxuser: siteAdmin.dxuser, accessToken: 'foo' }

    user1 = create.userHelper.create(em)
    exp1 = create.expertHelper.create(em, { user: user1 })
    user2 = create.userHelper.create(em)
    exp2 = create.expertHelper.create(em, { user: user2 })
    user3 = create.userHelper.create(em)
    exp3 = create.expertHelper.create(em, { user: user3 }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()
  })

  it('should get all experts as site admin', async () => {
    paginateStub
      .withArgs({ page: 1, pageSize: 10 })
      .resolves({ data: [exp1, exp2, exp3], meta: {} })

    expertService = getInstance(userCtx)

    const experts = await expertService.listExperts({
      page: 1,
      pageSize: 10,
    } as ExpertPaginationDTO)

    expect(experts.data).to.be.an('array')
    expect(experts.data).to.have.length(3)
  })

  it('should get only public experts as regular user', async () => {
    expertService = getInstance({ id: user1.id, dxuser: user1.dxuser, accessToken: 'foo' })

    paginateStub
      .withArgs(
        { page: 1, pageSize: 10 },
        { $or: [{ user: { id: user1.id } }, { scope: STATIC_SCOPE.PUBLIC }] },
      )
      .resolves({ data: [exp1, exp2], meta: {} })

    const experts = await expertService.listExperts({
      page: 1,
      pageSize: 10,
    } as ExpertPaginationDTO)

    expect(experts.data).to.be.an('array')
    expect(experts.data).to.have.length(2)
  })

  it('should delete expert and profile picture from files', async () => {
    findOneExpertStub.resolves(exp1)
    findOneFileStub.resolves({ id: 123 })
    nodesRemoveStub.resolves(Promise.resolve({}))

    await expertService.delete(exp1.id)

    expect(nodesRemoveStub.calledOnce).to.be.true()
  })

  describe('#search', async () => {
    const QUERY = 'QUERY'
    const RESULT = 'RESULT'

    beforeEach(() => {
      searchByMetaStub.reset()
      searchByMetaStub.throws()
      searchByMetaStub.withArgs(QUERY).resolves(RESULT)
    })

    it('return empty set for empty query', async () => {
      const res = await getInstance(userCtx).search(null)

      expect(res).to.deep.equal([])
    })

    it('should return the result of repo search', async () => {
      const res = await getInstance(userCtx).search(QUERY)

      expect(res).to.equal(RESULT)
    })
  })

  function getInstance(context: UserContext): ExpertService {
    const expertRepository = {
      paginate: paginateStub,
      findOne: findOneExpertStub,
      searchByMeta: searchByMetaStub,
    } as unknown as ExpertRepository
    const userFileRepository = {
      findOne: findOneFileStub,
    } as unknown as UserFileRepository
    const removeNodesService = {
      removeNodes: nodesRemoveStub,
    } as unknown as RemoveNodesFacade

    return new ExpertService(em, context, expertRepository, userFileRepository, removeNodesService)
  }
})
