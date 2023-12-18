import { SqlEntityManager } from '@mikro-orm/mysql'
import { ArrayUtils } from '@shared'
import { App } from '../../app'
import { Workflow } from '@shared/domain'

export class WorkflowService {
  private readonly em

  constructor(em: SqlEntityManager) {
    this.em = em
  }

  async getApps(workflow: Workflow) {
    const inputStages = workflow?.spec?.input_spec?.stages

    if (ArrayUtils.isEmpty(inputStages)) {
      return []
    }

    return await this.em.find(App, { uid: inputStages.map(s => s.app_uid) })
  }
}
