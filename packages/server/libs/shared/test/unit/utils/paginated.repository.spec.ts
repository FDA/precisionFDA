import { expect } from 'chai'
import { stub } from 'sinon'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'

type TestEntity = { id: number }

describe('PaginatedRepository#paginateWithPropertySort', () => {
  const createQbChain = (ids: number[]): {
    qb: {
      select: ReturnType<typeof stub>
      leftJoin: ReturnType<typeof stub>
      where: ReturnType<typeof stub>
      groupBy: ReturnType<typeof stub>
      orderBy: ReturnType<typeof stub>
      limit: ReturnType<typeof stub>
      offset: ReturnType<typeof stub>
      execute: ReturnType<typeof stub>
    }
    stubs: {
      orderByStub: ReturnType<typeof stub>
      executeStub: ReturnType<typeof stub>
    }
  } => {
    const selectStub = stub()
    const leftJoinStub = stub()
    const whereStub = stub()
    const groupByStub = stub()
    const orderByStub = stub()
    const limitStub = stub()
    const offsetStub = stub()
    const executeStub = stub().resolves(ids.map(id => ({ id })))

    const qb = {
      select: selectStub,
      leftJoin: leftJoinStub,
      where: whereStub,
      groupBy: groupByStub,
      orderBy: orderByStub,
      limit: limitStub,
      offset: offsetStub,
      execute: executeStub,
    }

    selectStub.returns(qb)
    leftJoinStub.returns(qb)
    whereStub.returns(qb)
    groupByStub.returns(qb)
    orderByStub.returns(qb)
    limitStub.returns(qb)
    offsetStub.returns(qb)

    return { qb, stubs: { orderByStub, executeStub } }
  }

  it('returns an empty page when total is zero', async () => {
    const countStub = stub().resolves(0)
    const createQueryBuilderStub = stub()
    const findStub = stub()

    const repo = {
      count: countStub,
      createQueryBuilder: createQueryBuilderStub,
      find: findStub,
    } as unknown as PaginatedRepository<TestEntity>

    const result = await PaginatedRepository.prototype.paginateWithPropertySort.call(
      repo,
      'customProperty',
      'ASC',
      {},
      1,
      10,
      'properties',
    )

    expect(createQueryBuilderStub.called).to.be.false()
    expect(findStub.called).to.be.false()
    expect(result).to.deep.equal({
      data: [],
      meta: { total: 0, totalPages: 1, pageSize: 10, page: 1 },
    })
  })

  it('uses ASC for match-priority ordering and orderDir for property value ordering', async () => {
    const countStub = stub().resolves(2)
    const findStub = stub().resolves([{ id: 1 }, { id: 2 }])
    const { qb, stubs } = createQbChain([2, 1])
    const createQueryBuilderStub = stub().returns(qb)

    const repo = {
      count: countStub,
      createQueryBuilder: createQueryBuilderStub,
      find: findStub,
    } as unknown as PaginatedRepository<TestEntity>

    const result = await PaginatedRepository.prototype.paginateWithPropertySort.call(
      repo,
      'customProperty',
      'DESC',
      {},
      1,
      10,
      'properties',
    )

    const orderByArg = stubs.orderByStub.getCall(0).args[0] as Record<string, string>
    expect(Object.values(orderByArg)).to.deep.equal(['ASC', 'DESC'])
    expect(result.data.map(item => item.id)).to.deep.equal([2, 1])
    expect(result.meta).to.deep.equal({
      total: 2,
      totalPages: 1,
      pageSize: 10,
      page: 1,
    })
  })

  it('returns empty data with total metadata when current page has no IDs', async () => {
    const countStub = stub().resolves(25)
    const findStub = stub()
    const { qb } = createQbChain([])
    const createQueryBuilderStub = stub().returns(qb)

    const repo = {
      count: countStub,
      createQueryBuilder: createQueryBuilderStub,
      find: findStub,
    } as unknown as PaginatedRepository<TestEntity>

    const result = await PaginatedRepository.prototype.paginateWithPropertySort.call(
      repo,
      'customProperty',
      'ASC',
      {},
      3,
      10,
      'properties',
    )

    expect(findStub.called).to.be.false()
    expect(result).to.deep.equal({
      data: [],
      meta: {
        total: 25,
        totalPages: 3,
        pageSize: 10,
        page: 3,
      },
    })
  })
})
