import { EntityRepository, FilterQuery, FindOptions, Loaded } from '@mikro-orm/mysql'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { PaginationDto } from '@shared/domain/entity/domain/pagination.dto'

export abstract class PaginatedRepository<T extends object> extends EntityRepository<T> {
  async paginate<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    paginationDto: PaginationDto,
    where: FilterQuery<T> = {},
    options?: Omit<FindOptions<T, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<T, Hint, Fields, Excludes>>> {
    const { page, pageSize: limit } = paginationDto

    const [data, total] = await this.findAndCount<Hint, Fields, Excludes>(where, {
      ...options,
      limit,
      offset: (page - 1) * limit,
    })

    return {
      data,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
        page,
      },
    }
  }
}
