import { DefaultState } from 'koa'
import Router from 'koa-router'
import { NotificationInput } from '@pfda/https-apps-shared/src/domain/notification/notification.input'
import { notification as notificationDomain } from '@pfda/https-apps-shared'
import { defaultMiddlewares } from '../server/middleware'

// Routes with /nodes prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.post(
  '/',
  async ctx => {
    const notification = ctx.request.body as NotificationInput
    const notificationService = new notificationDomain.NotificationService()
    notificationService.createNotification(notification)
    ctx.status = 204
  },
)

export { router }
