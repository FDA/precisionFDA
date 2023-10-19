import { SqlEntityManager } from '@mikro-orm/mysql'
import { App } from '../../app'
import { Workflow } from '../entity/workflow.entity'

export class WorkflowService {
  private readonly em

  constructor(em: SqlEntityManager) {
    this.em = em
  }
  async getApps(workflow: Workflow) {
    const appsUids = workflow?.spec.input_spec.stages.map(s => s.app_uid)

    return await this.em.find(App, { uid: appsUids })
  }
}
