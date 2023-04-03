import {DefaultState} from 'koa'
import Router from 'koa-router'
import { userFile } from '@pfda/https-apps-shared'
import { RemoveNodesInput } from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'

// Routes with /nodes prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/lock',
  makeSchemaValidationMdw({
    body: userFile.inputs.uidListSchema,
  }),
  async ctx => {
    // @ts-ignore TODO fix
    const ids = ctx.request.body.ids as number[]
    await new userFile.NodesLockOperation(pickOpsCtx(ctx)).execute({ids})
    ctx.status = 204
  },
)

router.post(
  '/unlock',
  makeSchemaValidationMdw({
    body: userFile.inputs.uidListSchema,
  }),
  async ctx => {
    //@ts-ignore TODO fix
    const ids = ctx.request.body.ids as number[]
    await new userFile.NodesUnlockOperation(pickOpsCtx(ctx)).execute({ids})
    ctx.status = 204
  },
)

router.delete(
  '/remove',
  makeSchemaValidationMdw({ body: userFile.inputs.removeNodesSchema }),

  async ctx => {
    const { ids, async } = ctx.request.body as RemoveNodesInput
    if (async) {
      await new userFile.StartRemoveNodesJob(pickOpsCtx(ctx)).execute({ ids })
      ctx.status = 204
    } else {
      const res = await new userFile.NodesRemoveOperation(pickOpsCtx(ctx)).execute({ ids, async })
      ctx.body = res
      ctx.status = 200
    }
  },
)

export { router }
