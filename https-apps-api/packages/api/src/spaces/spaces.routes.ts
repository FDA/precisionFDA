import { DefaultState } from 'koa'
import Router from 'koa-router'
import { email, space, spaceMembership, spaceEvent, entities, errors, client } from '@pfda/https-apps-shared'
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
        initUserId: ctx.user!.id,
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
        initUserId: ctx.user!.id,
        spaceId: ctx.params.id,
        activityType: spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE[spaceEvent.types.SPACE_EVENT_ACTIVITY_TYPE.space_unlocked],
      },
      receiverUserIds: [],
      emailTypeId: email.emailConfig.EMAIL_TYPES.spaceChanged as any,
    })

    ctx.status = 204
  },
)

router.patch(
  '/:id/fix_guest_permissions',
  async ctx => {

    const spaceToFix = await ctx.em.findOne(
      entities.Space,
      { id: ctx.params.id as any }, {},
    )

    const membership = await ctx.em.findOne(
      entities.SpaceMembership,
      {
        spaces: ctx.params.id as any,
        user: ctx.user!.id
      }, {}
    )

    if (spaceToFix == null ||
      membership == null ||
      spaceToFix.type !== space.types.SPACE_TYPE.GROUPS ||
      membership.role !== spaceMembership.types.SPACE_MEMBERSHIP_ROLE.LEAD) {
      throw new errors.PermissionError("Operation not permitted.")
    }

    const platformClient = new client.PlatformClient(ctx.user!.accessToken, ctx.log)
    if (membership.side === spaceMembership.types.SPACE_MEMBERSHIP_SIDE.GUEST) {
      try {
        // try to get some data from host project - should fail.
        const res = await platformClient.projectDescribe({
          projectDxid: spaceToFix.hostProject,
          body: {},
        })
      } catch (err) {
        throw new errors.PermissionError("Please contact host lead of this space to perform the same action. You can copy the URL and send it to the lead.")
      }
      // if no error, the permissions are correct.
      throw new errors.PermissionError("Permissions are already corrected for guest side.")
    } else {
      // check project first.
      const res = await platformClient.projectDescribe({
        projectDxid: spaceToFix.hostProject,
        body: {
          "fields": {
            "permissions": true
          },
        },
      })

      if (spaceToFix.guestDxOrg in res.permissions) {
        throw new errors.PermissionError("Permissions are already corrected for guest side.")
      }

      const response = await platformClient.projectInvite({
        projectDxid: spaceToFix.hostProject,
        invitee: spaceToFix.guestDxOrg,
        level: 'CONTRIBUTE',
      })

      ctx.log.info({ response }, "Guest organization invited to host project.")
    }

    ctx.status = 204
  },
)

router.get(
  '/:id/selectable-spaces',

  async ctx => {
    const res = await new space.SelectableSpacesOperation(pickOpsCtx(ctx))
      .execute(parseInt(ctx.params.id))

    ctx.body = res
    ctx.status = 200
  },
)

export { router }
