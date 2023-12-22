import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import {
  client,
  DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  entities,
  license as licenseDomain,
  UserContext,
} from '@shared'
import { Workflow } from '@shared/domain'
import { DxId } from '@shared/domain/entity'
import { WorkflowDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { UidInput, UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/workflows')
export class WorkflowController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

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

    return await new licenseDomain.LicensesForWorkflowOperation(opsCtx).execute({
      ...body,
      uid,
    })
  }

  // uses pFDA uid , not platfrom dxid
  @HttpCode(201)
  @Get('/:uid/describe')
  async describeWorkflow(@Param('uid') uid: string) {
    const workflow = await this.em.findOneOrFail(entities.Workflow, { uid }, { populate: ['user'] })

    const platformClient = new client.PlatformClient(this.user.accessToken, this.log)

    const platformWorkflowData = await platformClient.workflowDescribe({
      dxid: workflow.dxid,
      data: {},
    })

    return this.constructResponse(platformWorkflowData, workflow)
  }

  private constructResponse(platformWorkflowData: WorkflowDescribeResponse, workflow: Workflow) {
    const result = {
      ...platformWorkflowData,
      dxid: platformWorkflowData.id,
      id: workflow.uid,
      title: workflow.title,
      name: workflow.name,
      location: workflow.scope,
      revision: workflow.revision,
      'created-at': workflow.createdAt,
      'updated-at': workflow.updatedAt,
      'added-by': workflow.user.getProperty('dxuser'),
    }

    return result
  }
}
