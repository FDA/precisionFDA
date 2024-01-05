import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ArrayUtils } from '@shared'
import { App } from '../../app'
import { Workflow } from '@shared/domain'

@Injectable()
export class WorkflowService {
  constructor(private readonly em: SqlEntityManager) {}

  async getApps(workflow: Workflow) {
    const inputStages = workflow?.spec?.input_spec?.stages

    if (ArrayUtils.isEmpty(inputStages)) {
      return []
    }

    return await this.em.find(App, { uid: inputStages.map((s) => s.app_uid) })
  }
}
