import { config } from '../../../..'
import { Workflow } from '../../../workflow'
import { WorkflowService } from '../../../workflow/service/workflow.service'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'
import { EntityProvenanceDataService } from './entity-provenance-data.service'

export class WorkflowProvenanceDataService implements EntityProvenanceDataService<'workflow'> {
  private readonly workflowService
  constructor(workflowService: WorkflowService) {
    this.workflowService = workflowService
  }

  getData(workflow: Workflow): EntityProvenanceData<'workflow'> {
    return {
      type: 'workflow',
      url: `${config.api.railsHost}/home/workflows/${workflow.uid}`,
      title: workflow.title,
    }
  }

  async getParents(workflow: Workflow): Promise<EntityProvenanceSourceUnion[]> {
    const apps = await this.workflowService.getApps(workflow)

    return apps.map(a => ({
      type: 'app',
      entity: a,
    }))
  }
}
