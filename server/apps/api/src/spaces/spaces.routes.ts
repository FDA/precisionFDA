import {
  client,
  email,
  entities,
  errors,
  space,
  spaceEvent,
  spaceMembership,
  spaceReport,
  userFile,
  user,
  utils,
} from '@shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import { SpaceReportCreateFacade } from '../facade/space-report-create.facade'
import { SpaceReportDeleteFacade } from '../facade/space-report-delete.facade'
import { defaultMiddlewares } from '../server/middleware'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import {
  deleteSpaceReportQuerySchema,
} from './spaces.schema'

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
        user: ctx.user!.id,
      }, {},
    )

    if (spaceToFix == null ||
      membership == null ||
      spaceToFix.type !== space.types.SPACE_TYPE.GROUPS ||
      membership.role !== spaceMembership.types.SPACE_MEMBERSHIP_ROLE.LEAD) {
      throw new errors.PermissionError('Operation not permitted.')
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
        throw new errors.PermissionError('Please contact host lead of this space to perform the same action. You can copy the URL and send it to the lead.')
      }
      // if no error, the permissions are correct.
      throw new errors.PermissionError('Permissions are already corrected for guest side.')
    } else {
      // check project first.
      const res = await platformClient.projectDescribe({
        projectDxid: spaceToFix.hostProject,
        body: {
          'fields': {
            'permissions': true,
          },
        },
      })

      if (spaceToFix.guestDxOrg in res.permissions) {
        throw new errors.PermissionError('Permissions are already corrected for guest side.')
      }

      const response = await platformClient.projectInvite({
        projectDxid: spaceToFix.hostProject,
        invitee: spaceToFix.guestDxOrg,
        level: 'CONTRIBUTE',
      })

      ctx.log.info({ response }, 'Guest organization invited to host project.')
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

// TODO(PFDA-4701) - cover reports with integration tests after setting up full test env
router.post(
  '/:id/report',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  async ctx => {
    const opsCtx = pickOpsCtx(ctx)

    const facade = new SpaceReportCreateFacade(opsCtx, spaceReport.SpaceReportService.getInstance(ctx.em.fork({ useContext: true })))

    const report = await facade.createSpaceReport(parseInt(ctx.params?.id, 10))

    ctx.body = report?.id
    ctx.status = 200
  },
)

router.get(
  '/:id/report',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  async ctx => {
    const opsCtx = pickOpsCtx(ctx)

    const em = opsCtx.em.fork({ useContext: true })
    const spaceReportService = spaceReport.SpaceReportService.getInstance(em)

    ctx.body = await spaceReportService.getReportsForSpace(parseInt(ctx.params?.id, 10), em.getReference(user.User, opsCtx.user.id))
    ctx.status = 200
  },
)

router.delete(
  '/report',
  makeSchemaValidationMdw({ query: deleteSpaceReportQuerySchema }),
  async ctx => {
    const em = ctx.em.fork({ useContext: true })
    const facade = new SpaceReportDeleteFacade(
      em,
      spaceReport.SpaceReportService.getInstance(em),
      new userFile.NodesRemoveOperation(pickOpsCtx({ ...ctx, em })),
    )

    const opsCtx = pickOpsCtx(ctx)

    const idStrings = Array.isArray(ctx.query.id) ? ctx.query.id : [ctx.query.id]
    const ids = idStrings.map(i => Number(i))

    ctx.body = await facade.deleteSpaceReports(ids, em.getReference(user.User, opsCtx.user.id))
    ctx.status = 200
  },
)

export { router }
