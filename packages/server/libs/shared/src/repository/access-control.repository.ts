import { BaseEntity } from '@shared/database/base.entity'
import { FilterQuery, Loaded } from '@mikro-orm/mysql'
import { FindOneOptions, FindOptions } from '@mikro-orm/core'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'

export abstract class AccessControlRepository<
  Entity extends BaseEntity,
> extends PaginatedRepository<Entity> {
  async findAccessible<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    pagination: PaginationDTO<Entity>,
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<Entity, Hint, Fields, Excludes>>> {
    const accessibleWhere = await this.getAccessibleWhere()
    const mergedWhere = this.getMergedWhere(where, accessibleWhere)

    return this.paginate(pagination, mergedWhere, options)
  }

  async findEditable<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    pagination: PaginationDTO<Entity>,
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<Entity, Hint, Fields, Excludes>>> {
    const editableWhere = await this.getEditableWhere()
    const mergedWhere = this.getMergedWhere(where, editableWhere)

    return this.paginate(pagination, mergedWhere, options)
  }

  // async findAccessibleOne(
  //   where: FilterQuery<Entity> = {},
  //   options?: FindOneOptions<Entity>,
  // ): Promise<Entity | null> {
  //   const accessWhere = await this.getAccessibleWhere()
  //   const mergedWhere = this.getMergedWhere(where, accessWhere)
  //   return this.findOne(mergedWhere, options)
  // }

  protected abstract getAccessibleWhere(): Promise<FilterQuery<Entity>>

  protected abstract getEditableWhere(): Promise<FilterQuery<Entity>>

  private getMergedWhere(
    baseWhere: FilterQuery<Entity>,
    additionalWhere: FilterQuery<Entity>,
  ): FilterQuery<Entity> {
    if (Object.keys(baseWhere).length === 0) {
      return additionalWhere
    }

    if (Object.keys(additionalWhere).length === 0) {
      return baseWhere
    }

    return { $and: [baseWhere, additionalWhere] } as FilterQuery<Entity>
  }
}
