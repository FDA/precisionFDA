import { DefaultState } from 'koa'
import Router from 'koa-router'
import { job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils'

const router = new Router<DefaultState, Api.Ctx>()

router.get('/', makeValidationMdw({ query: utils.schemas.paginationSchema }), async ctx => {
  const jobs = await new jobDomain.ListJobsOperation(pickOpsCtx(ctx)).execute({
    page: ctx.validatedQuery.page ?? 1,
    limit: ctx.validatedQuery.limit ?? 10,
  })
  ctx.body = jobs
})

router.get(
  '/:jobDxId',
  makeValidationMdw({ params: utils.schemas.getDxidInputSchema('jobDxId') }),
  async ctx => {
    const job = await new jobDomain.DescribeJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = job
  },
)

router.patch(
  '/:jobDxId/terminate',
  makeValidationMdw({ params: utils.schemas.getDxidInputSchema('jobDxId') }),
  async ctx => {
    const res = await new jobDomain.RequestTerminateJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = res
  },
)

export { router }
