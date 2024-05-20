import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityDataProvider } from './entity-data.provider'

export class SpaceMembershipEntityDataProvider extends EntityDataProvider<'spaceMembership'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.SPACE_MEMBERSHIP
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP
  protected readonly spaceEventDataKeys: Extract<keyof SpaceMembership, string>[] = ['role', 'side']
}
