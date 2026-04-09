import { FindOneOptions, FindOptions } from '@mikro-orm/core'
import { FilterQuery, Loaded } from '@mikro-orm/mysql'
import { Logger } from '@nestjs/common'
import { BaseEntity } from '@shared/database/base.entity'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { PaginationDTO } from '@shared/domain/entity/domain/pagination.dto'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { createUserContextManager } from '@shared/domain/user-context/storage/user-context-storage.manager'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

const EMPTY_PAGEABLE_RESULT = {
  data: [],
  meta: {
    total: 0,
    totalPages: 1,
    pageSize: 0,
    page: 1,
  },
}
const EMPTY_FIND_RESULT = []
const EMPTY_FIND_ONE_RESULT = null

export abstract class AccessControlRepository<Entity extends BaseEntity> extends PaginatedRepository<Entity> {
  protected readonly user: UserContext = createUserContextManager(userContextStorage)
  @ServiceLogger()
  private readonly logger: Logger

  async paginateAccessible<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    pagination: PaginationDTO<Entity>,
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<Entity, Hint, Fields, Excludes>>> {
    const accessibleWhere = await this.getAccessibleWhere()
    if (!accessibleWhere) {
      this.logger.log('No accessible entities found, returning empty result')
      return EMPTY_PAGEABLE_RESULT
    }

    const mergedWhere = this.getMergedWhere(where, accessibleWhere)

    return this.paginate(pagination, mergedWhere, options)
  }

  async paginateEditable<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    pagination: PaginationDTO<Entity>,
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<Entity, Hint, Fields, Excludes>>> {
    const editableWhere = await this.getEditableWhere()
    if (!editableWhere) {
      this.logger.log('No editable entities found, returning empty result')
      return EMPTY_PAGEABLE_RESULT
    }
    const mergedWhere = this.getMergedWhere(where, editableWhere)

    return this.paginate(pagination, mergedWhere, options)
  }

  async findAccessible<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    const accessibleWhere = await this.getAccessibleWhere()
    if (!accessibleWhere) {
      this.logger.log('No accessible entities found, returning empty result')
      return EMPTY_FIND_RESULT
    }
    const mergedWhere = this.getMergedWhere(where, accessibleWhere)

    return this.find(mergedWhere, options)
  }

  async findEditable<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    const editableWhere = await this.getEditableWhere()
    if (!editableWhere) {
      this.logger.log('No editable entities found, returning empty result')
      return EMPTY_FIND_RESULT
    }

    const mergedWhere = this.getMergedWhere(where, editableWhere)

    return this.find(mergedWhere, options)
  }

  async findAccessibleOne<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Entity> = {},
    options?: FindOneOptions<Entity, Hint, Fields, Excludes>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const accessibleWhere = await this.getAccessibleWhere()
    if (!accessibleWhere) {
      this.logger.log('No accessible entities found, returning empty result')
      return EMPTY_FIND_ONE_RESULT
    }
    const mergedWhere = this.getMergedWhere(where, accessibleWhere)
    return this.findOne(mergedWhere, options)
  }

  async findEditableOne<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Entity> = {},
    options?: FindOneOptions<Entity, Hint, Fields, Excludes>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const editableWhere = await this.getEditableWhere()
    if (!editableWhere) {
      this.logger.log('No editable entities found, returning empty result')
      return EMPTY_FIND_ONE_RESULT
    }
    const mergedWhere = this.getMergedWhere(where, editableWhere)
    return this.findOne(mergedWhere, options)
  }

  /**
   * Gets the where clause for accessible entities.
   * In case no entities are accessible - returns null
   * In case some entities are accessible - returns the where clause object
   * In case all entities are accessible - returns empty object
   */
  protected abstract getAccessibleWhere(): Promise<FilterQuery<Entity>>

  /**
   * Gets the where clause for editable entities.
   * In case no entities are editable - returns null
   * In case some entities are editable - returns the where clause object
   * In case all entities are editable - returns empty object
   */
  protected abstract getEditableWhere(): Promise<FilterQuery<Entity>>

  private getMergedWhere(baseWhere: FilterQuery<Entity>, additionalWhere: FilterQuery<Entity>): FilterQuery<Entity> {
    if (Object.keys(baseWhere).length === 0) {
      return additionalWhere
    }

    if (Object.keys(additionalWhere).length === 0) {
      return baseWhere
    }

    return { $and: [baseWhere, additionalWhere] } as FilterQuery<Entity>
  }
}
