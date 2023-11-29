import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile } from '@shared'
import { NodesInput } from '@shared/domain/user-file/user-file.input'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'

// Routes with /nodes prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/lock',
  makeSchemaValidationMdw({
    body: userFile.inputs.nodesSchema,
  }),
  async ctx => {
    const { ids, async } = ctx.request.body as NodesInput
    if (async) {
      await new userFile.RequestNodesLockOperation(pickOpsCtx(ctx)).execute({ ids })
      ctx.status = 204
    } else {
      await new userFile.NodesLockOperation(pickOpsCtx(ctx)).execute({ ids, async })
      ctx.status = 204
    }
  },
)

router.post(
  '/unlock',
  makeSchemaValidationMdw({
    body: userFile.inputs.nodesSchema,
  }),
  async ctx => {
    const { ids, async } = ctx.request.body as NodesInput
    if (async) {
      await new userFile.RequestNodesUnlockOperation(pickOpsCtx(ctx)).execute({ ids })
      ctx.status = 204
    } else {
      await new userFile.NodesUnlockOperation(pickOpsCtx(ctx)).execute({ ids, async })
      ctx.status = 204
    }
  },
)

router.delete(
  '/remove',
  makeSchemaValidationMdw({ body: userFile.inputs.nodesSchema }),

  async ctx => {
    const { ids, async } = ctx.request.body as NodesInput
    if (async) {
      await new userFile.StartRemoveNodesJob(pickOpsCtx(ctx)).execute({ ids })
      ctx.status = 204
    } else {
      ctx.body = await new userFile.NodesRemoveOperation(pickOpsCtx({ ...ctx, em: ctx.em.fork() })).execute({ ids, async })
      ctx.status = 200
    }
  },
)

export { router }
