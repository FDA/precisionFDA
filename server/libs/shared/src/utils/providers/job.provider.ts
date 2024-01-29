import { Job } from '@shared/domain/job/job.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityDataProvider } from './entity-data.provider'

export class SpaceEventJobEntityDataProvider extends EntityDataProvider<'job'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.JOB
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.JOB
  protected readonly spaceEventDataKeys: Extract<keyof Job, string>[] = ['name']
}
