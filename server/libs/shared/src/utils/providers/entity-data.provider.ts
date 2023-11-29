import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityType, NameToDbEntityMap } from '../object-utils'

abstract class EntityDataProvider<T extends EntityType> {
  public abstract readonly entityType: ENTITY_TYPE

  public abstract readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE

  protected abstract readonly spaceEventDataKeys: Extract<keyof NameToDbEntityMap[T], string>[]

  public getSpaceEventJsonData(entity: NameToDbEntityMap[T]): string {
    if (entity == null) {
      return 'null entity'
    }

    try {
      return JSON.stringify(entity, this.spaceEventDataKeys)
    } catch {
      return 'error'
    }
  }
}

export { EntityDataProvider }
