import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { LicensesForWorkflowOperation } from '@shared/domain/license/ops/licenses-for-workflow'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { WorkflowUidParamDto } from './model/workflow-uid-param.dto'

@UseGuards(UserContextGuard)
@Controller('/workflows')
export class WorkflowController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  @Get('/:workflowUid/licenses-to-accept')
  async getLicencesToAccept(@Param() params: WorkflowUidParamDto) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new LicensesForWorkflowOperation(opsCtx).execute({
      uid: params.workflowUid,
    })
  }
}
