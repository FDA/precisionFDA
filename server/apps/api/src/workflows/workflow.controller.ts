import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import {
  DEPRECATED_SQL_ENTITY_MANAGER,
} from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { LicensesForWorkflowOperation } from '@shared/domain/license/ops/licenses-for-workflow'
import { UidInput, UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { schemas } from '@shared/utils/base-schemas'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/workflows')
export class WorkflowController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {
  }

  @Get('/:workflowId/licenses-to-accept')
  async getLicencesToAccept(
    @Param('workflowId', new JsonSchemaPipe(schemas.dxidProp)) uid: DxId<'workflow'>,
    @Body() body: UidInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new LicensesForWorkflowOperation(opsCtx).execute({
      ...body,
      uid,
    })
  }
}
