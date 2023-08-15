import { DefaultState } from 'koa'
import Router from 'koa-router'
import { config } from '@pfda/https-apps-shared'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../server/utils'

const router = new Router<DefaultState, Api.Ctx>()

router.get(
    '/',
    async (ctx: Api.Ctx) => {

        ctx.status = 200
        // Request-specific logic
        if (isRequestFromFdaSubnet(ctx)) {
            Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
                ctx.body = {...ctx.body, [featureName]: featureConfig.isEnabled ? featureConfig : {isEnabled: false}}
            })
            if (!isRequestFromAuthenticatedUser(ctx)) {
                ctx.body = {...ctx.body, cdmh: {isEnabled: false}}
            }
        } else {
            Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
                ctx.body = {...ctx.body, [featureName]: {isEnabled: false}}
            })
        }
    })

export { router }
