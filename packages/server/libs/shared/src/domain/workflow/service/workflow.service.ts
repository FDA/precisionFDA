import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { ArrayUtils } from '@shared/utils/array.utils'

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
