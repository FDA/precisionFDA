import { DefaultState } from 'koa'
import Router from 'koa-router'
import { acceptedLicense, license } from '@pfda/https-apps-shared'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.get(
  '/accepted',
  async ctx => {
    const [acceptedLicenses]
      = await ctx.em.findAndCount(acceptedLicense.AcceptedLicense, { user: ctx.user!.id })

    ctx.body = acceptedLicenses
    ctx.status = 200
  },
)

router.post(
  '/files',
  makeSchemaValidationMdw({
    body: license.inputs.filesSchema,
  }),
  async ctx => {
    const res = await new license.LicensesForFilesOperation(pickOpsCtx(ctx)).execute({
      ...ctx.request.body as license.inputs.FilesInput,
    })
    ctx.body = res
    ctx.status = 200
  },
)

export { router }
