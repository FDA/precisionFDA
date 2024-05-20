import { Space } from '@shared/domain/space/space.entity'
import { EntityDataProvider } from './entity-data.provider'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'

export class SpaceEntityDataProvider extends EntityDataProvider<'space'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.SPACE
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.SPACE
  protected readonly spaceEventDataKeys: Extract<keyof Space, string>[] = ['name']
}
