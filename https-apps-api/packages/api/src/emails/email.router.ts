import { DefaultState } from 'koa'
import Router from 'koa-router'
import { email } from '@pfda/https-apps-shared'
import { defaultMiddlewares, makeValidationMdw } from '../server/middleware'
import { pickOpsCtx } from '../utils'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/:emailId/send',
  makeValidationMdw({
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
