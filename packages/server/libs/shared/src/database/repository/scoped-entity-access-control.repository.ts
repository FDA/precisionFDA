import { FilterQuery, FindOptions, Loaded } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { ScopedEntityPaginationDTO } from '@shared/domain/entity/domain/scoped-entity-pagination.dto'
import { HOME_SCOPE } from '@shared/enums'
import { EntityScope } from '@shared/types/common'

// Intermediate layer that adds scope- and location-aware accessible-where resolution for scoped entities.
export abstract class ScopedEntityAccessControlRepository<
  Entity extends ScopedEntity,
> extends AccessControlRepository<Entity> {
  async paginateAccessible<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    pagination: ScopedEntityPaginationDTO<Entity>,
    where: FilterQuery<Entity> = {},
    options?: Omit<FindOptions<Entity, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<PaginatedResult<Loaded<Entity, Hint, Fields, Excludes>>> {
    const scope = pagination.scope
    const location = pagination.filter?.location
    const accessibleWhere = await this.getAccessibleWhereByScope(scope, location)
    if (!accessibleWhere) {
      this.logger.log('No accessible entities found, returning empty result')
      return this.EMPTY_PAGEABLE_RESULT
    }

    const mergedWhere = this.getMergedWhere(where, accessibleWhere)

    const isPropertySorting = !!Object.keys(pagination.sort ?? {}).find(s => s.startsWith('props.'))
    if (isPropertySorting) {
      return this.paginateWithPropertySort(pagination, mergedWhere, options)
    } else {
      return this.paginate(pagination, mergedWhere, options)
    }
  }

  protected abstract getAccessibleWhereByScope(
    scope?: EntityScope | HOME_SCOPE.SPACES,
    location?: string,
  ): Promise<FilterQuery<Entity>>
}
