import { DefaultState } from 'koa'
import Router from 'koa-router'
import { dataPortal, client } from '@pfda/https-apps-shared'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { defaultMiddlewares } from '../server/middleware'
import { file, dataPortalCreate, dataPortalUpdate } from './data-portals.schemas'

// Routes with /data-portals prefix
const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

/**
 * Creates new resource (just the metadata).
 */
router.post(
  '/:id/resources',
  makeSchemaValidationMdw({ body: file }),
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const body = ctx.request.body as dataPortal.FileParam
    const res = await dataPortalService.createResource(body, parseInt(ctx.params.id), ctx.user!.id)
    ctx.body = res
    ctx.status = 201
  },
)

/**
 * Removes resource from the database.
 */
router.delete(
  '/:portalId/resources/:resourceId',
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const res = await dataPortalService.removeResource(parseInt(ctx.params.resourceId), ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

/**
 * Creates resource link.
 */
router.post(
  '/:portalId/resources/:resourceId',
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const res = await dataPortalService.createResourceLink(parseInt(ctx.params.resourceId))
    ctx.body = res
    ctx.status = 201
  },
)

/**
 * Creates new card image (just the metadata).
 */
router.post(
  '/:id/card-image',
  makeSchemaValidationMdw({ body: file }),
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const body = ctx.request.body as dataPortal.FileParam
    const res = await dataPortalService.createCardImage(body, parseInt(ctx.params.id), ctx.user!.id)
    ctx.body = res
    ctx.status = 201
  },
)

/**
 * Creates new data portal.
 */
router.post(
  '/',
  makeSchemaValidationMdw({ body: dataPortalCreate }),
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const body = ctx.request.body as dataPortal.DataPortalParam
    const res = await dataPortalService.create(body, ctx.user!.id)
    ctx.body = res
    ctx.status = 201
  },
)

/**
 * Updates data portal.
 */
router.patch(
  '/:id',
  makeSchemaValidationMdw({ body: dataPortalUpdate }),
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const body = ctx.request.body as dataPortal.DataPortalParam
    const res = await dataPortalService.update(body, ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

/**
 * List is not returning content of the portal.
 */
router.get(
  '/',
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const res = await dataPortalService.list(ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

/**
 * Returns details of the portal (including content).
 */
router.get(
  '/:id',
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const res = await dataPortalService.get(parseInt(ctx.params.id), ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

/**
 * Returns list of resources that belong to given portal
 */
router.get(
  '/:id/resources',
  async ctx => {
    const userClient = new client.PlatformClient(ctx.user?.accessToken!, ctx.log)
    const dataPortalService = new dataPortal.DataPortalService(ctx.em, userClient)
    const res = await dataPortalService.listResources(parseInt(ctx.params.id), ctx.user!.id)
    ctx.body = res
    ctx.status = 200
  },
)

export { router }
