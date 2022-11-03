import { DefaultState } from 'koa'
import Router from 'koa-router'
import { email } from '@pfda/https-apps-shared'
import { EmailProcessInput } from '@pfda/https-apps-shared/src/domain/email/email.config'
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
    const body = ctx.request.body as Omit<EmailProcessInput, 'emailTypeId'>
    const res = await new email.EmailProcessOperation(pickOpsCtx(ctx)).execute({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId: ctx.params.emailId as any,
    })
    ctx.body = res
  },
)

export { router }
