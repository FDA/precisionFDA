import { Injectable } from '@nestjs/common'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { WorkflowService } from '../../../workflow/service/workflow.service'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class WorkflowProvenanceDataService extends EntityProvenanceDataService<'workflow'> {
  protected type = 'workflow' as const
  constructor(
    private readonly workflowService: WorkflowService,
    entityService: EntityService,
  ) {
    super(entityService)
  }

  protected getIdentifier(workflow: Workflow): string {
    return workflow.uid
  }

  async getParents(workflow: Workflow): Promise<EntityProvenanceSourceUnion[]> {
    const apps = await this.workflowService.getApps(workflow)

    return apps.map((a) => ({
      type: 'app',
      entity: a,
    }))
  }

  async getChildren(): Promise<EntityProvenanceSourceUnion[]> {
    return []
  }
}
