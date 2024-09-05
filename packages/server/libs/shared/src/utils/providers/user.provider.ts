import { User } from '@shared/domain/user/user.entity'
import { EntityDataProvider } from './entity-data.provider'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'

export class UserEntityDataProvider extends EntityDataProvider<'user'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.USER
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.SPACE // doesn't apply
  protected readonly spaceEventDataKeys: Extract<keyof User, string>[] = ['dxuser']
}
