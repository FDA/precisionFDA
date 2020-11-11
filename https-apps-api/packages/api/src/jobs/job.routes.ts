import { DefaultState } from 'koa'
import Router from 'koa-router'
import { makeValidationMdw } from '../server/middleware/validation'
import { schemas, pickOpsCtx } from '../utils'
import { DescribeJobOperation } from './ops/describe'

const router = new Router<DefaultState, Api.Ctx>()

router.get(
  '/:jobDxId',
  makeValidationMdw({ params: schemas.getDxidInputSchema('jobDxId') }),
  async ctx => {
    const job = await new DescribeJobOperation(pickOpsCtx(ctx)).execute({
      dxid: ctx.params.jobDxId,
    })
    ctx.body = job
  },
)

export { router }
