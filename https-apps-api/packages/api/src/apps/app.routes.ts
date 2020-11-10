import { DefaultState } from 'koa'
import Router from 'koa-router'
import { makeValidationMdw } from '../server/middleware/validation'
import { jobIdAppIdSchema, runAppSchema } from '../jobs/domain/job.input'
import { CreateJobOperation } from '../jobs/ops/create'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { getDxidInputSchema } from '../utils/validator'
import { DescribeJobOperation } from '../jobs/ops/describe'

const router = new Router<DefaultState, Api.Ctx>()

router.get('/', async ctx => {
  // todo:
  console.log('return list of relevant apps')
  ctx.body = {}
})

router.post(
  '/:appDxId/jobs',
  makeValidationMdw({ body: runAppSchema, params: getDxidInputSchema('appDxId') }),
  async ctx => {
    // todo:
    const res = await new CreateJobOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body,
      appDxId: ctx.params.appDxId,
    })
    ctx.body = res
    ctx.status = 201
  },
)

router.get('/:appDxId/jobs/:dxid', makeValidationMdw({ params: jobIdAppIdSchema }), async ctx => {
  const res = await new DescribeJobOperation(pickOpsCtx(ctx)).execute({
    dxid: ctx.params.dxid,
    appId: ctx.params.appDxId,
  })
  // todo: serializer strategy
  ctx.body = res
})

export { router }
