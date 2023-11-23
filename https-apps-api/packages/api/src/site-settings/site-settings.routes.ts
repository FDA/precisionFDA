import type { DefaultState } from 'koa'
import Router from 'koa-router'
import type { client } from '@pfda/https-apps-shared'
import { config, dataPortal, errors } from '@pfda/https-apps-shared'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'

const router = new Router<DefaultState, Api.Ctx>()

router.get(
  '/',
  async (ctx: Api.Ctx) => {
    ctx.status = 200
    // Request-specific logic
    if (isRequestFromFdaSubnet(ctx)) {
      Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
        ctx.body = {
          ...ctx.body,
          [featureName]: featureConfig.isEnabled ? featureConfig : { isEnabled: false }
        }
      })
      if (!isRequestFromAuthenticatedUser(ctx)) {
        ctx.body = { ...ctx.body, cdmh: { isEnabled: false }}
      }
    } else {
      Object.entries(config.siteSettings).forEach(([featureName]) => {
        ctx.body = { ...ctx.body, [featureName]: { isEnabled: false }}
      })
    }

    if (!isRequestFromAuthenticatedUser(ctx)) {
      return
    }
    try {
      const dataPortalService = new dataPortal.DataPortalService(
        ctx.em,
        {} as client.PlatformClient,
      )
      await dataPortalService.getDefault(ctx.user.id)
      ctx.body.dataPortals = { isEnabled: true }
    } catch (error) {
      if (error instanceof errors.PermissionError || error instanceof errors.NotFoundError) {
        ctx.body.dataPortals = { isEnabled: false }
      } else {
        throw new errors.ServiceError(
          `Unexpected error while checking Data Portals feature: ${error}`,
        )
      }
    }
  },
)

export { router }
