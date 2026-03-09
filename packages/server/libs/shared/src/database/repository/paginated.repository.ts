import { EntityRepository, FilterQuery, FindOptions, Loaded } from '@mikro-orm/mysql'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'

export abstract class PaginatedRepository<T extends object> extends EntityRepository<T> {
  async paginate<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    pagination: PaginationDTO<T>,
    where: FilterQuery<T> = {},
    // options?: Omit<FindOptions<T, Hint, Fields, Excludes>, 'limit' | 'offset' | 'orderBy'>,
    options?: Omit<FindOptions<T, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<T, Hint, Fields, Excludes>>> {
    const { page, pageSize: limit, sort: orderBy } = pagination

    const offset = this.calculateOffset(page, limit)

    const [data, total] = await this.findAndCount<Hint, Fields, Excludes>(where, {
      ...options,
      limit,
      offset,
      orderBy,
    })

    return {
      data,
      meta: {
        total,
        //TODO PFDA-6051 revisit what to return if limit is not set.
        totalPages: limit ? Math.ceil(total / limit) : 1,
        pageSize: limit ?? 0,
        page,
      },
    }
  }

  private calculateOffset(page?: number, limit?: number): number | null {
    if (page == null || limit == null) {
      return null
    }
    return (page - 1) * limit
  }

  persist(entity: T | Iterable<T>): void {
    this.getEntityManager().persist(entity)
  }

  async persistAndFlush(entity: T | Iterable<T>): Promise<void> {
    await this.getEntityManager().persistAndFlush(entity)
  }

  async flush(): Promise<void> {
    await this.getEntityManager().flush()
  }

  remove(entity: T | Iterable<T>): void {
    this.getEntityManager().remove(entity)
  }

  async removeAndFlush(entity: T | Iterable<T>): Promise<void> {
    await this.getEntityManager().removeAndFlush(entity)
  }
}
