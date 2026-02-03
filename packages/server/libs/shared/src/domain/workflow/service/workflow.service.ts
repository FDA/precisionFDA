import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { ArrayUtils } from '@shared/utils/array.utils'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { Uid } from '@shared/domain/entity/domain/uid'
import WorkflowRepository from '@shared/domain/workflow/entity/workflow.repository'

@Injectable()
export class WorkflowService implements SearchableByUid<'workflow'> {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  getAccessibleEntityByUid(uid: Uid<'workflow'>): Promise<Workflow | null> {
    return this.workflowRepository.findAccessibleOne({ uid })
  }
  getEditableEntityByUid(uid: Uid<'workflow'>): Promise<Workflow | null> {
    return this.workflowRepository.findEditableOne({ uid })
  }

  async getApps(workflow: Workflow): Promise<App[]> {
    const inputStages = workflow?.spec?.input_spec?.stages

    if (ArrayUtils.isEmpty(inputStages)) {
      return []
    }

    return await this.em.find(App, { uid: inputStages.map((s) => s.app_uid) })
  }
}
