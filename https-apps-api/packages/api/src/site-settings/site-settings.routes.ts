import { DefaultState } from 'koa'
import Router from 'koa-router'
import { config } from '@pfda/https-apps-shared'
import { makeValidateFdaSubnetMdw } from '../server/middleware/fda-subnet'
import { makeValidateUserContextMdw } from '../server/middleware/user-context'

const router = new Router<DefaultState, Api.Ctx>()

Object.entries(config.siteSettings).forEach(([featureName, featureConfig]) => {
  const {
    shouldCheckFdaSubnet,
    shouldRequireUserSession,
  } = featureConfig.middleware
  const endpoint = `/${featureName}`
  if (shouldCheckFdaSubnet && !config.devFlags.fda.skipFdaSubnetIpCheck) {
    router.use(endpoint, makeValidateFdaSubnetMdw())
  }
  if (shouldRequireUserSession) {
    router.use(makeValidateUserContextMdw())
  }
  router.get(endpoint, async (ctx: Api.Ctx) => {
    const { isEnabled, data } = featureConfig.response
    // eslint-disable-next-line multiline-ternary
    ctx.body = isEnabled ? {
      isEnabled,
      data,
    } : {
      isEnabled,
    }
  })
})

export { router }
