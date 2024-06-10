import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Extends } from '@shared/utils/types/extends'
import { PropertyKeysOfType } from '@shared/utils/types/property-keys-of-type'

type NamedEntityType = Extends<
  EntityType,
  | 'app'
  | 'asset'
  | 'comparison'
  | 'file'
  | 'folder'
  | 'job'
  | 'user'
  | 'workflow'
  | 'resource'
  | 'note'
  | 'dbcluster'
>
type NamedEntity = EntityInstance<NamedEntityType>

export class EntityUtils {
  static getEntityTypeForEntity<T extends EntityType>(entity: EntityInstance<T>): T {
    const entityType: T = Object.keys(entityTypeToEntityMap).find(
      (entityType) => entity instanceof entityTypeToEntityMap[entityType],
    ) as T

    if (entityType) {
      return entityType
    }

    throw new Error('Unknown entity type')
  }

  private static entityTypeToNameKeyMap: {
    [T in NamedEntityType]: PropertyKeysOfType<EntityInstance<T>, string>
  } = {
    app: 'title',
    asset: 'name',
    comparison: 'name',
    file: 'name',
    folder: 'name',
    job: 'name',
    user: 'fullName',
    workflow: 'title',
    resource: 'name',
    note: 'title',
    dbcluster: 'name',
  }

  static getEntityName(entity: NamedEntity): string {
    const entityType = EntityUtils.getEntityTypeForEntity(entity)
    const nameKey = EntityUtils.entityTypeToNameKeyMap[entityType]

    return entity[nameKey]
  }
}
