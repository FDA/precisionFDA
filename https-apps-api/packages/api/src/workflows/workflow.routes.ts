import { DefaultState } from 'koa'
import Router from 'koa-router'
import { entities, client } from '@pfda/https-apps-shared'
import { Workflow } from '@pfda/https-apps-shared/src/domain'
import { WorkflowDescribeResponse } from '@pfda/https-apps-shared/src/platform-client/platform-client.responses'
import { defaultMiddlewares } from '../server/middleware'


// Routes with /workflows prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

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

    const platformClient = new client.PlatformClient(ctx.log)

    const platformWorkflowData = await platformClient.workflowDescribe({
      dxid: workflow.dxid,
      accessToken: ctx.user.accessToken,
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
