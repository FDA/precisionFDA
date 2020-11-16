import { DefaultState } from 'koa'
import Router from 'koa-router'
import { job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils'

const router = new Router<DefaultState, Api.Ctx>()

router.get('/', makeValidationMdw({ query: utils.schemas.paginationSchema }), async ctx => {
  const jobs = await new jobDomain.ListJobsOperation(pickOpsCtx(ctx)).execute({
    page: ctx.query.page ?? 1,
    limit: ctx.query.limit ?? 10,
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

export { router }
