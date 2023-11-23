import { validateBodyMiddleware } from '../server/middleware/validateBody'
import { PropertiesPostReqBody, propertiesPostRequestSchema } from './properties.schemas'
import { property as propertyDomain } from '@pfda/https-apps-shared'
import Router from 'koa-router'
import { DefaultState } from 'koa'
import { PropertyType } from '@pfda/https-apps-shared/src/domain/property/property.entity'

const router = new Router<DefaultState, Api.Ctx>()

// Routes with /properties prefix
router.post(
  '/',
  validateBodyMiddleware(propertiesPostRequestSchema),
  async ctx => {
    const body = ctx.request.body as PropertiesPostReqBody
    const propertyService = new propertyDomain.PropertyService(ctx.em, ctx.user!)
    const res = await propertyService.setProperty({
      targetId: body.targetId,
      targetType: body.targetType,
      properties: body.properties!,
    })
    ctx.body = res
    ctx.status = 201
  },
)

// fetch list of valid property key options for user and given scope.
router.get(
  // CACHING THIS WOULD HELP A LOT - but also would need Cache Eviction Policy
  '/:targetType/scope/:scope/keys',
  async ctx => {
    const { scope, targetType } = ctx.params
    const propertyService = new propertyDomain.PropertyService(ctx.em, ctx.user!)
    const res = await propertyService.getValidKeys({
      scope,
      targetType: targetType as PropertyType,
    })

    ctx.body = { keys: res }
    ctx.status = 200
  },
)

export { router }
