import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityDataProvider } from './entity-data.provider'

export class WorkflowEntityDataProvider extends EntityDataProvider<'workflow'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.WORKFLOW
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.WORKFLOW
  protected readonly spaceEventDataKeys: Extract<keyof Workflow, string>[] = ['name']
}
