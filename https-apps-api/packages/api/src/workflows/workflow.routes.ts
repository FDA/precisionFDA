import { DefaultState } from 'koa'
import Router from 'koa-router'
import { entities, client, utils, license as licenseDomain } from '@pfda/https-apps-shared'
import { Workflow } from '@pfda/https-apps-shared/src/domain'
import {
  WorkflowDescribeResponse,
} from '@pfda/https-apps-shared/src/platform-client/platform-client.responses'
import { defaultMiddlewares } from '../server/middleware'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { makeSchemaValidationMdw } from '../server/middleware/validation'

// Routes with /workflows prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.get(
  '/:workflowId/licenses-to-accept',
  makeSchemaValidationMdw({
    params: utils.schemas.getDxidInputSchema('workflowId'),
  }),

  async ctx => {
    const res = await new licenseDomain.LicensesForWorkflowOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body,
      uid: ctx.params.workflowId,
    })

    ctx.body = res
    ctx.status = 200
  },
)

// uses pFDA uid , not platfrom dxid
router.get(
  '/:uid/describe',
  async (ctx: Api.Ctx) => {
    const workflow = await ctx.em.findOneOrFail(
      entities.Workflow,
      {
        uid: ctx.params.uid,
      }, { populate: ['user'] },
    )

    const platformClient = new client.PlatformClient(ctx.user!.accessToken, ctx.log)

    const platformWorkflowData = await platformClient.workflowDescribe({
      dxid: workflow.dxid,
      data: {},
    })

    const result = constructResponse(platformWorkflowData, workflow)

    ctx.body = result
    ctx.status = 201
  },
)

function constructResponse(platformWorkflowData: WorkflowDescribeResponse, workflow: Workflow) {
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


export { router }
