import { DefaultState } from 'koa'
import Router from 'koa-router'
import { email, space, spaceEvent } from '@pfda/https-apps-shared'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'

// Routes with /spaces prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)


// TODO most of the ops can be patch instead of post (currently used by ruby), might refactor
router.patch(
  '/:id/accept',
  async ctx => {
    await new space.SpaceAcceptOperation(pickOpsCtx(ctx)).execute({
      spaceId: ctx.params.id as any,
    })

    ctx.status = 204
  },
)

router.patch(
  '/:id/lock',
  async ctx => {
    await new space.SpaceLockOperation(pickOpsCtx(ctx)).execute({
      spaceId: ctx.params.id as any,
    })
    await new email.EmailProcessOperation(pickOpsCtx(ctx)).execute({
      input: {
        initUserId: ctx.user.id,
        spaceId: ctx.params.id,
        activityType: spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE[spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      },
      receiverUserIds: [],
      emailTypeId: email.emailConfig.EMAIL_TYPES.spaceChanged as any,
    })

    ctx.status = 204
  },
)

router.patch(
  '/:id/unlock',
  async ctx => {
    await new space.SpaceUnlockOperation(pickOpsCtx(ctx)).execute({
      spaceId: ctx.params.id as any,
    })

    await new email.EmailProcessOperation(pickOpsCtx(ctx)).execute({
      input: {
        initUserId: ctx.user.id,
        spaceId: ctx.params.id,
        activityType: spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE[spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE.space_unlocked],
      },
      receiverUserIds: [],
      emailTypeId: email.emailConfig.EMAIL_TYPES.spaceChanged as any,
    })

    ctx.status = 204
  },
)

export { router }
