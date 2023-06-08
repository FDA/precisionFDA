/* eslint-disable no-undefined */
/* eslint-disable multiline-ternary */
import { FilterQuery } from '@mikro-orm/core/typings'
import { EntityRepository } from '@mikro-orm/mysql'
import { FilterSchemaNode, FilterWithColumnNode } from '../utils/filters'
import { ColumnNode, resolveColumnNode } from '../utils/sql-json-column-utils'
import { validateDefined } from '../validation/validators'
import { BaseEntity } from './base-entity'

type FindPaginatedOpts<T extends BaseEntity> = {
  page: number
  perPage: number
  orderBy?: keyof T
  orderDir: 'ASC' | 'DESC'
  filters: FilterQuery<T>
}


type FindPaginatedWithJsonFields<
  T extends BaseEntity,
  FilterSchemaT extends Record<string, FilterSchemaNode>,
> = Omit<FindPaginatedOpts<T>, 'orderBy' | 'filters'> & {
  orderBy: ColumnNode<T>
  filters: FilterWithColumnNode<T, FilterSchemaT>[]
}

// TODO(samuel) migrate this class into utils instead
// REASON: it's better not to use inheritance, as what we're aiming for is philosophically closer
// to Java interfaces
export abstract class PaginatedEntityRepository<T extends BaseEntity> extends EntityRepository<T> {
  // Note - copied from /client repo
  private cleanObject <T extends {}>(obj: T) {
    return Object.fromEntries(Object.entries(obj).filter(([_, val]) => validateDefined(val)))
  }

  protected abstract getEntityKey(): string
  protected transformPaginatedResponse(
    entities: T[],
    totalCount: number,
    page: number,
    perPage: number,
  ) {
    const resultsKey = this.getEntityKey()
    const hasPrevPage = page > 1 && totalCount > (page - 2) * perPage
    const hasNextPage = page * perPage < totalCount
    return {
      [resultsKey]: entities,
      meta: {
        count: entities.length,
        pagination: {
          currentPage: page,
          prevPage: hasPrevPage ? page - 1 : null,
          nextPage: hasNextPage ? page + 1 : null,
          totalPages: Math.ceil(totalCount / perPage),
          totalCount,
        },
      },
    }
  }

  async findPaginated({
    page,
    perPage,
    orderBy,
    orderDir,
    filters
  }: FindPaginatedOpts<T>) {
    //@ts-ignore PK: unable to resolve following compilatin issue
    const [entities, totalCount] = await this.findAndCount(this.cleanObject(filters), {
      limit: perPage,
      offset: (page - 1) * perPage,
      ...orderBy ? {
        orderBy: {
          [orderBy]: orderDir,
        },
      } : {},
    })
    return this.transformPaginatedResponse(entities, totalCount, page, perPage)
  }

  async findPaginatedWithJsonFields<FilterSchemaT extends Record<string, FilterSchemaNode>>({
    page,
    perPage,
    orderBy,
    orderDir,
    filters,
  }: FindPaginatedWithJsonFields<T, FilterSchemaT>) {
    const qb = this.createQueryBuilder()
    // NOTE(samuel) - protection against sql injection is in pagination middleware
    // orderBy is required field and therefore is always validated
    qb.select('*')
      .where(Object.fromEntries(filters.filter((filter) => validateDefined(filter.value)).map((filter) => [resolveColumnNode(filter.columnNode), filter.value])))
      .limit(perPage)
      .offset((page - 1) * perPage)
    if (orderBy) {
      qb.orderBy({ [resolveColumnNode(orderBy)]: orderDir })
    }
    const entities = await qb.getResult()
    const count: any = await qb.count('id').execute('run', true)
    const totalCount = count[0].count as number
    return this.transformPaginatedResponse(entities, totalCount, page, perPage)
  }
}
