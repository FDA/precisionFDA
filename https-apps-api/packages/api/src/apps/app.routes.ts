import { DefaultState } from 'koa'
import Router from 'koa-router'
import { app as appDomain, job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'

const router = new Router<DefaultState, Api.Ctx>()

router.get('/', async ctx => {
  const res = await new appDomain.ListAppsOperation(pickOpsCtx(ctx)).execute()
  ctx.body = res
})

router.post(
  '/:appDxId/run',
  makeValidationMdw({
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
