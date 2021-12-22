import { DefaultState } from 'koa'
import Router from 'koa-router'
import { job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils'
import { jobSyncFilesQuerySchema } from './job.schemas'


// Routes with /jobs prefix
const router = new Router<DefaultState, Api.Ctx>()

const jobDxIdInputSchema = utils.schemas.getDxidInputSchema('jobDxId')

// not used at the moment
router.get('/', makeValidationMdw({ query: utils.schemas.paginationSchema }), async ctx => {
  const jobs = await new jobDomain.ListJobsOperation(pickOpsCtx(ctx)).execute({
    page: ctx.validatedQuery.page ?? 1,
    limit: ctx.validatedQuery.limit ?? 10,
  })
  ctx.body = jobs
})

// not used at the moment
router.get(
  '/:jobDxId',
  makeValidationMdw({ params: jobDxIdInputSchema }),
  async ctx => {
    const job = await new jobDomain.DescribeJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = job
  },
)

router.patch(
  '/:jobDxId/terminate',
  makeValidationMdw({ params: jobDxIdInputSchema }),
  async ctx => {
    const res = await new jobDomain.RequestTerminateJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = res
  },
)

router.patch(
  '/:jobDxId/syncFiles',
  makeValidationMdw({ params: jobDxIdInputSchema, query: jobSyncFilesQuerySchema }),
  async ctx => {
    const res = await new jobDomain.RequestWorkstationSyncFilesOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
      force: ctx.validatedQuery.force,
    })
    ctx.body = res
  },
)

export { router }
