import { config } from '../../config'
import { InternalError } from '../../errors'
import { APP_HTTPS_SUBTYPE } from './app.enum'
import { App } from './app.entity'

export const getAppHandle = ({
  app,
  appType,
}: {
  app: App
  appType: APP_HTTPS_SUBTYPE
}): string => {
  // we should determine type from pfda database but we do not have the info complete for now
  switch (appType) {
    case APP_HTTPS_SUBTYPE.JUPYTER:
      // todo: handle spark cluster as well here
      return config.platform.appHandles.jupyter
    case APP_HTTPS_SUBTYPE.TTYD:
      return config.platform.appHandles.ttyd
    // todo: ????
    case APP_HTTPS_SUBTYPE.SHINY:
      return app.dxid
    // case APP_HTTPS_SUBTYPE.CLOUDWS:
    //   return config.platform.appHandles.cloudwatch
    // case APP_HTTPS_SUBTYPE.CUSTOM:
    //   return app.dxid
    default:
      throw new InternalError(`App type ${appType} is not supported`)
  }
}
