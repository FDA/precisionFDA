import { FindOneOptions, FindOptions } from '@mikro-orm/core'
import { FilterQuery, Loaded } from '@mikro-orm/mysql'
import { BaseEntity } from '@shared/database/base.entity'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createUserContextManager } from '@shared/domain/user-context/storage/user-context-storage.manager'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'

export abstract class AccessControlRepository<
  Entity extends BaseEntity,
> extends PaginatedRepository<Entity> {
  protected readonly user: UserContext = createUserContextManager(userContextStorage)

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

  async findAllAccessible<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    const accessibleWhere = await this.getAccessibleWhere()
    const mergedWhere = this.getMergedWhere(where, accessibleWhere)

    return this.find(mergedWhere, options)
  }

  async findAllEditable<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    const editableWhere = await this.getEditableWhere()
    const mergedWhere = this.getMergedWhere(where, editableWhere)

    return this.find(mergedWhere, options)
  }

  async findAccessibleOne<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    where: FilterQuery<Entity> = {},
    options?: FindOneOptions<Entity, Hint, Fields, Excludes>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const accessibleWhere = await this.getAccessibleWhere()
    const mergedWhere = this.getMergedWhere(where, accessibleWhere)
    return this.findOne(mergedWhere, options)
  }

  async findEditableOne<
    Hint extends string = never,
    Fields extends string = '*',
    Excludes extends string = never,
  >(
    where: FilterQuery<Entity> = {},
    options?: FindOneOptions<Entity, Hint, Fields, Excludes>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const editableWhere = await this.getEditableWhere()
    const mergedWhere = this.getMergedWhere(where, editableWhere)
    return this.findOne(mergedWhere, options)
  }

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
