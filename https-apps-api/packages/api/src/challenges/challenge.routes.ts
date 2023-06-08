import { DefaultState } from 'koa'
import Router from 'koa-router'
import { challenge } from '@pfda/https-apps-shared'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { ChallengeProposeInput } from '@pfda/https-apps-shared/src/domain/challenge/ops/propose-challenge'

// Routes with /challenges prefix
const router = new Router<DefaultState, Api.Ctx>()

// router.use(defaultMiddlewares)

router.post(
  '/propose',
  async ctx => {

    const body = ctx.request.body as ChallengeProposeInput
    await new challenge.ChallengeProposeOperation(pickOpsCtx(ctx)).execute(body)
    ctx.status = 204
  },
)

export { router }
