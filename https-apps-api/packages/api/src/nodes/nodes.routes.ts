import {DefaultState} from 'koa'
import Router from 'koa-router'
import {userFile} from '@pfda/https-apps-shared'
import {pickOpsCtx} from '../utils/pick-ops-ctx'
import {defaultMiddlewares} from '../server/middleware'
import {makeSchemaValidationMdw} from '../server/middleware/validation'

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

export {router}
