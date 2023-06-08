import { DefaultState } from 'koa'
import Router from 'koa-router'
import { job as jobDomain, utils } from '@pfda/https-apps-shared'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import {
  jobListQuerySchema,
  jobSetAPIKeyBodySchema,
  JobSetAPIKeyParams,
  jobSnapshotBodySchema,
  JobSnapshotParams,
  jobSyncFilesQuerySchema,
  workstationAliveBodySchema,
  WorkstationAliveParams,
} from './job.schemas'


// Routes with /jobs prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

const jobDxIdInputSchema = utils.schemas.getDxidInputSchema('jobDxId')

// not used at the moment
router.get('/', makeSchemaValidationMdw({ query: jobListQuerySchema }), async ctx => {
  const jobs = await new jobDomain.ListJobsOperation(pickOpsCtx(ctx)).execute({
    page: ctx.validatedQuery.page ?? 1,
    limit: ctx.validatedQuery.limit ?? 10,
    scope: ctx.validatedQuery.scope ?? undefined,
    spaceId: ctx.validatedQuery.spaceId ?? undefined,
  })
  ctx.body = jobs
})

// not used at the moment
router.get(
  '/:jobDxId',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema }),
  async ctx => {
    const job = await new jobDomain.DescribeJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = job
  },
)

// ------------------------
//    HTTPS Workstations
// ------------------------

router.patch(
  '/:jobDxId/terminate',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema }),
  async ctx => {
    const res = await new jobDomain.RequestTerminateJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = res
  },
)

router.patch(
  '/:jobDxId/syncFiles',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema, query: jobSyncFilesQuerySchema }),
  async ctx => {
    const res = await new jobDomain.RequestWorkstationSyncFilesOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
      force: ctx.validatedQuery.force,
    })
    ctx.body = res
  },
)

router.patch(
  '/:jobDxId/checkAlive',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema, body: workstationAliveBodySchema }),
  async ctx => {
    // const res = await new jobDomain.WorkstationCheckAliveOperation(pickOpsCtx(ctx)).execute()
    const params = ctx.request.body as WorkstationAliveParams
    const workstationService = await new jobDomain.WorkstationService(pickOpsCtx(ctx), params.code).initWithJob(ctx.params.jobDxId)
    const res = await workstationService.alive()
    ctx.body = res
  },
)

router.patch(
  '/:jobDxId/setAPIKey',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema, body: jobSetAPIKeyBodySchema }),
  async ctx => {
    const params = ctx.request.body as JobSetAPIKeyParams
    const workstationService = await new jobDomain.WorkstationService(pickOpsCtx(ctx), params.code).initWithJob(ctx.params.jobDxId)
    const res = await workstationService.setAPIKey(params.key)
    ctx.body = res
  },
)

router.patch(
  '/:jobDxId/snapshot',
  makeSchemaValidationMdw({ params: jobDxIdInputSchema, body: jobSnapshotBodySchema }),
  async ctx => {
    const params = ctx.request.body as JobSnapshotParams
    const terminate = params.terminate ?? false
    const input = {
      ...params,
      jobDxid: ctx.params.jobDxId,
      terminate,
    }
    await new jobDomain.WorkstationSnapshotOperation(pickOpsCtx(ctx)).enqueue(input)
    ctx.body = { 'message': `Snapshot for workstation ${input.jobDxid} started` }
  },
)

export { router }
