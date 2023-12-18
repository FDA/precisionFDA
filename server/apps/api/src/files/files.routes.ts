import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile } from '@shared'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import { JSONSchema7 } from 'json-schema'
import { CloseFileInput } from '@shared/domain/user-file/user-file.input'

// Routes with /files prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

// TODO temporarily
const fileCloseSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string'},
    forceWaitForClose: { type: 'string'},
  },
  required: ['id'],
  additionalProperties: false,
}

// Close an uploaded file
//   Note that the file uid (not dxid) is used here, e.g.
//   /files/file-xxxx-1/close
//
router.patch(
  '/:id/close',
  makeSchemaValidationMdw({ params: fileCloseSchema }),
  async ctx => {
    const body = ctx.request.body as CloseFileInput
    const res = await new userFile.FileCloseOperation(pickOpsCtx(ctx)).execute(body)
    ctx.body = res
  },
)

export { router }
