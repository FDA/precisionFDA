import { DefaultState } from 'koa'
import Router from 'koa-router'
import {
  job as jobDomain,
  utils,
  entities,
  client, app as appDomain, license as licenseDomain } from '@pfda/https-apps-shared'
import { RunAppInput } from '@pfda/https-apps-shared/src/domain/job/job.input'
import { App } from '@pfda/https-apps-shared/src/domain'
import {
  AppDescribeResponse,
} from '@pfda/https-apps-shared/src/platform-client/platform-client.responses'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import { AppInput } from '@pfda/https-apps-shared/src/domain/app/app.input'
import { makeValidateUserContextMdw } from '../server/middleware/user-context'

// Routes with /apps prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)
router.use(makeValidateUserContextMdw())

router.post(
  '/',
  makeSchemaValidationMdw({
    body: appDomain.inputs.saveAppSchema,
  }),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as AppInput
    const platformClient = new client.PlatformClient(ctx.user!.accessToken)
    const appService = new appDomain.AppService(ctx.em, platformClient)
    const res = await appService.create(body, ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

router.get(
  '/:appDxId/licenses-to-accept',
  makeSchemaValidationMdw({
    params: utils.schemas.getDxidInputSchema('appDxId'),
  }),

  async ctx => {
    const res = await new licenseDomain.LicensesForAppOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body,
      uid: ctx.params.appDxId,
    })

    ctx.body = res
    ctx.status = 200
  },
)

router.post(
  '/:appDxId/run',
  makeSchemaValidationMdw({
    body: jobDomain.inputs.runAppSchema,
    params: utils.schemas.getDxidInputSchema('appDxId'),
  }),
  async (ctx: Api.Ctx) => {
    const body = ctx.request.body as Omit<RunAppInput, 'appDxid'>
    const input: RunAppInput = {
      ...body,
      appDxId: ctx.params.appDxId,
    }

    const res = await new jobDomain.CreateJobOperation(pickOpsCtx(ctx)).execute(input)
    ctx.body = res
    ctx.status = 201
  },
)

// uses pFDA uid , not platfrom dxid
router.get(
  '/:uid/describe',
  async (ctx: Api.Ctx) => {
    const app = await ctx.em.findOneOrFail(
      entities.App,
      {
        uid: ctx.params.uid,
      }, { populate: ['user'] },
    )

    const platformClient = new client.PlatformClient(ctx.user!.accessToken, ctx.log)
    const platformAppData = await platformClient.appDescribe({
      dxid: app.dxid,
      data: {},
    })

    const result = constructResponse(platformAppData, app)

    ctx.body = result
    ctx.status = 201
  },
)

function constructResponse(platformAppData: AppDescribeResponse, app: App) {
  const result = {
    ...platformAppData,
    dxid: platformAppData.id,
    id: app.uid,
    title: app.title,
    revision: app.revision,
    location: app.scope,
    'created-at': app.createdAt,
    'updated-at': app.updatedAt,
    'added-by': app.user.getProperty('dxuser'),
    'internet-access': app.spec.internet_access,
    'instance-type': app.spec.instance_type,
  }

  return result
}

export { router }
