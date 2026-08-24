import { FilterQuery, FindOptions, Loaded, QBFilterQuery, raw } from '@mikro-orm/mysql'
import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'

export abstract class PaginatedRepository<T extends object> extends BaseEntityRepository<T> {
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

  /**
   * Paginate with sorting by a related property (from the `properties` table).
   *
   * Uses LEFT JOIN on the entity's properties relation, GROUP BY to avoid
   * duplicates, and a two-part ORDER BY:
   *   1. Rows with the matching property name come first (CASE → 0)
   *   2. Then sorted by the matching property's value
   *
   * @param propertyName       The property name to sort by
   * @param orderDir           Sort direction
   * @param where              Filter conditions
   * @param page               Page number (1-based)
   * @param limit              Page size
   * @param propertiesRelation Name of the OneToMany properties relation on the entity
   * @param populate           Optional populate hints for the final entity load
   */
  async paginateWithPropertySort<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    pagination: PaginationDTO<T>,
    where: FilterQuery<T>,
    options?: Omit<FindOptions<T, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<T, Hint, Fields, Excludes>>> {
    const page = pagination.page ?? 1
    const limit = pagination.pageSize ?? 10
    const offset = (page - 1) * limit

    const { propertyName, orderDir } = this.extractPropertySort(pagination)

    // Get total count (unaffected by property sorting)
    const total = await this.count(where)

    if (total === 0) {
      return {
        data: [],
        meta: { total: 0, totalPages: 1, pageSize: limit, page },
      }
    }

    // Get sorted, paginated IDs using LEFT JOIN on properties
    // GROUP BY ensures each entity appears only once despite multiple properties
    const qb = this.createQueryBuilder('e')
      .select('e.id')
      .leftJoin(`e.properties`, 'p')
      .where(where as QBFilterQuery<T>)
      .groupBy('e.id')
      .orderBy({
        [raw(`MIN(CASE WHEN p.property_name = ? THEN 0 ELSE 1 END)`, [propertyName])]: 'ASC',
        [raw(`MIN(CASE WHEN p.property_name = ? THEN p.property_value ELSE NULL END)`, [propertyName])]: orderDir,
      })
      .limit(limit)
      .offset(offset)

    const result: Array<{ id: number }> = await qb.execute('all')
    const ids: number[] = result.map(r => r.id)

    if (ids.length === 0) {
      return {
        data: [],
        meta: {
          total,
          totalPages: Math.ceil(total / limit),
          pageSize: limit,
          page,
        },
      }
    }

    const entities = await this.find({ id: { $in: ids } } as unknown as FilterQuery<T>, {
      ...options,
    })

    // Preserve the order from the sorted query
    const idOrder = new Map(ids.map((id, idx) => [id, idx]))
    entities.sort((a, b) => (idOrder.get((a as { id: number }).id) ?? 0) - (idOrder.get((b as { id: number }).id) ?? 0))

    return {
      data: entities,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
        page,
      },
    }
  }

  extractPropertySort(
    pagination: PaginationDTO<T>,
  ): { propertyName: string; orderDir: 'ASC' | 'DESC' } | Record<string, never> {
    const sort = pagination.sort
    if (!sort || typeof sort !== 'object') return {}

    for (const key of Object.keys(sort)) {
      if (key.startsWith('props.')) {
        const propertyName = key.replace('props.', '')
        const dir = (sort as Record<string, string>)[key]?.toUpperCase?.()
        return {
          propertyName: propertyName,
          orderDir: dir === 'ASC' ? 'ASC' : 'DESC',
        }
      }
    }

    return {}
  }

  private calculateOffset(page?: number, limit?: number): number | null {
    if (page == null || limit == null) {
      return null
    }
    return (page - 1) * limit
  }
}
