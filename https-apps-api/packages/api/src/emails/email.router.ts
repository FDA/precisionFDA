import { DefaultState } from 'koa'
import Router from 'koa-router'
import { email } from '@pfda/https-apps-shared'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/:emailId/send',
  makeSchemaValidationMdw({
    params: email.inputs.sendEmailParamSchema,
    body: email.inputs.sendEmailBodySchema,
  }),
  async ctx => {
    const res = await new email.EmailProcessOperation(pickOpsCtx(ctx)).execute({
      input: ctx.request.body.input,
      receiverUserIds: ctx.request.body.receiverUserIds,
      emailTypeId: ctx.params.emailId as any,
    })
    ctx.body = res
  },
)

export { router }
