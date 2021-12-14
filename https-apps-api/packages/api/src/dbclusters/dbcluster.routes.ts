import { DefaultState } from 'koa'
import Router from 'koa-router'
import { dbCluster as dbClusterDomain, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'

const router = new Router<DefaultState, Api.Ctx>()

router.post(
  '/start',
  makeValidationMdw({ body: utils.schemas.getDxidsInputSchema('dxids') }),
  async ctx => {
    const dxIds = ctx.request.body.dxids

    await Promise.all(
      dxIds.map(async dxid => {
        return await new dbClusterDomain.StartDbClusterOperation(pickOpsCtx(ctx)).execute({
          dxid: dxid
        })
      })
    )
    ctx.status = 204
  },
)

router.post(
  '/stop',
  makeValidationMdw({ body: utils.schemas.getDxidsInputSchema('dxids') }),
  async ctx => {
    const dxIds = ctx.request.body.dxids

    await Promise.all(
      dxIds.map(async dxid => {
        return await new dbClusterDomain.StopDbClusterOperation(pickOpsCtx(ctx)).execute({
          dxid: dxid
        })
      })
    )
    ctx.status = 204
  },
)

router.post(
  '/terminate',
  makeValidationMdw({ body: utils.schemas.getDxidsInputSchema('dxids') }),
  async ctx => {
    const dxIds = ctx.request.body.dxids

    await Promise.all(
      dxIds.map(async dxid => {
        return await new dbClusterDomain.TerminateDbClusterOperation(pickOpsCtx(ctx)).execute({
          dxid: dxid
        })
      })
    )
    ctx.status = 204
  },
)

router.post(
  '/create',
  makeValidationMdw({ body: dbClusterDomain.inputs.createDbClusterSchema }),
  async ctx => {
    const res = await new dbClusterDomain.CreateDbClusterOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body
    })
    ctx.body = res
    ctx.status = 201
  },
)

export { router }
