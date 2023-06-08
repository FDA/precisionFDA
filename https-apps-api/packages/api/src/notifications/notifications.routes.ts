import { DefaultState } from 'koa'
import Router from 'koa-router'
import { NotificationInput } from '@pfda/https-apps-shared/src/domain/notification/notification.input'
import { notification as notificationDomain } from '@pfda/https-apps-shared'
import { defaultMiddlewares } from '../server/middleware'

// Routes with /notifications prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/',
  async ctx => {
    const notification = ctx.request.body as NotificationInput
    const notificationService = new notificationDomain.NotificationService(ctx.em)
    notificationService.createNotification(notification)
    ctx.status = 204
  },
)

router.put(
  '/:notificationId',
  async ctx => {
    const input = ctx.request.body as NotificationInput
    input.id = parseInt(ctx.params.notificationId)

    const notificationService = new notificationDomain.NotificationService(ctx.em)
    const updated = await notificationService.updateDeliveredAt(input.id, input.deliveredAt, ctx.user?.id)

    updated.user = undefined
    ctx.status = 200
    ctx.body = updated
  },
)

export { router }
