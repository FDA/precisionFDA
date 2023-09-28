import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { Asset } from '../../domain/user-file'
import { EntityDataProvider } from './entity-data.provider'

export class AssetEntityDataProvider extends EntityDataProvider<'asset'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.NODE
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.ASSET
  protected readonly spaceEventDataKeys: Extract<keyof Asset, string>[] = ['name', 'uid']
}
