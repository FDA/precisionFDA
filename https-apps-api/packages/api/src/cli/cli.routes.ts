import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile } from '@pfda/https-apps-shared'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { makeSchemaValidationMdw } from "../server/middleware/validation";

// Routes with /cli prefix
// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
const router = new Router<DefaultState, Api.Ctx>()

// router.use(defaultMiddlewares)

// Finds all matching nodes and returns them.
router.post(
  '/nodes',
  makeSchemaValidationMdw({
    body: userFile.inputs.CLINodeSearchSchema,
  }),
  async ctx => {

    const {spaceId, folderId, arg, type} = ctx.request.body as userFile.inputs.CLINodeSearchInput

    const res = await new userFile.CLINodeSearchOperation(pickOpsCtx(ctx)).execute({
      spaceId,
      folderId,
      arg,
      type
    })

    const body = {
      files: res,
      folders: []
    }
    // we will need some sort of mappers or serializers to match ruby output.


    ctx.body = body
    ctx.status = 200
  },
)

router.get('/version/latest', async ctx => {
  ctx.body = {'version': '2.3'}
  ctx.status = 200
})

export { router }
