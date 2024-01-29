import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityDataProvider } from './entity-data.provider'

export class ComparisonEntityDataProvider extends EntityDataProvider<'comparison'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.COMPARISON
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.COMPARISON
  protected readonly spaceEventDataKeys: Extract<keyof Comparison, string>[] = ['name']
}
