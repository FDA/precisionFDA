import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { App } from '../../domain/app'
import { EntityDataProvider } from './entity-data.provider'

export class AppEntityDataProvider extends EntityDataProvider<'app'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.APP
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.APP
  protected readonly spaceEventDataKeys: Extract<keyof App, string>[] = ['title']
}
