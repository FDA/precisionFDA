import { Folder } from '@shared/domain/user-file/folder.entity'
import { EntityDataProvider } from './entity-data.provider'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'

export class FolderEntityDataProvider extends EntityDataProvider<'folder'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.NODE
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.FILE // No object type for folder
  protected readonly spaceEventDataKeys: Extract<keyof Folder, string>[] = ['name']
}
