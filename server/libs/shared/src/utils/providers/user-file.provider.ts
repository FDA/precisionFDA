import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { UserFile } from '../../domain/user-file'
import { EntityDataProvider } from './entity-data.provider'

export class UserFileEntityDataProvider extends EntityDataProvider<'userFile'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.NODE
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.FILE
  protected readonly spaceEventDataKeys: Extract<keyof UserFile, string>[] = ['name', 'uid']
}
