import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { WorkflowService } from '../../../workflow/service/workflow.service'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

@Injectable()
export class WorkflowProvenanceDataService implements EntityProvenanceDataService<'workflow'> {
  constructor(private readonly workflowService: WorkflowService) {}

  getData(workflow: Workflow): EntityProvenanceData<'workflow'> {
    return {
      type: 'workflow',
      url: `${config.api.railsHost}/home/workflows/${workflow.uid}`,
      title: workflow.title,
    }
  }

  async getParents(workflow: Workflow): Promise<EntityProvenanceSourceUnion[]> {
    const apps = await this.workflowService.getApps(workflow)

    return apps.map((a) => ({
      type: 'app',
      entity: a,
    }))
  }
}
