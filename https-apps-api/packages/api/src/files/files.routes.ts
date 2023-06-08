import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile, utils } from '@pfda/https-apps-shared'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'

// Routes with /files prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

// Close an uploaded file
//   Note that the file uid (not dxid) is used here, e.g.
//   /files/file-xxxx-1/close
//
router.patch(
  '/:uid/close',
  makeSchemaValidationMdw({ params: utils.schemas.uidInputSchema }),
  async ctx => {
    const res = await new userFile.FileCloseOperation(pickOpsCtx(ctx)).execute({
      uid: ctx.params.uid,
    })
    ctx.body = res
  },
)

export { router }
