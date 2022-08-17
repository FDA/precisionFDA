import { DefaultState } from 'koa'
import Router from 'koa-router'
import { job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/:appDxId/run',
  makeSchemaValidationMdw({
    body: jobDomain.inputs.runAppSchema,
    params: utils.schemas.getDxidInputSchema('appDxId'),
  }),
  async ctx => {
    const res = await new jobDomain.CreateJobOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body,
      appDxId: ctx.params.appDxId,
    })
    ctx.body = res
    ctx.status = 201
  },
)

export { router }
