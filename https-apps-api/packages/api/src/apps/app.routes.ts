import { DefaultState } from 'koa'
import Router from 'koa-router'
import { makeValidationMdw } from '../server/middleware/validation'
import { runAppSchema } from '../jobs/domain/job.input'
import { CreateJobOperation } from '../jobs/ops/create'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { schemas } from '../utils/validator'
import { ListAppsOperation } from './ops/list'

const router = new Router<DefaultState, Api.Ctx>()

router.get('/', async ctx => {
  const res = await new ListAppsOperation(pickOpsCtx(ctx)).execute()
  ctx.body = res
})

router.post(
  '/:appDxId/run',
  makeValidationMdw({ body: runAppSchema, params: schemas.getDxidInputSchema('appDxId') }),
  async ctx => {
    const res = await new CreateJobOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body,
      appDxId: ctx.params.appDxId,
    })
    ctx.body = res
    ctx.status = 201
  },
)

export { router }
