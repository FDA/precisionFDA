import { APP_HTTPS_SUBTYPE } from '../app/app.enum'
import { InternalError } from '../../errors'
import { User } from './user.entity'

const getProjectForAppType = (user: User, appType: APP_HTTPS_SUBTYPE): string => {
  switch (appType) {
    case APP_HTTPS_SUBTYPE.JUPYTER:
      return user.jupyterProject
    case APP_HTTPS_SUBTYPE.SHINY:
      // fixme:
      return user.ttydProject
    case APP_HTTPS_SUBTYPE.TTYD:
      return user.ttydProject
    // case APP_HTTPS_SUBTYPE.CLOUDWS:
    //   return user.cloudWorkstationProject
    // case APP_HTTPS_SUBTYPE.CUSTOM:
    //   return user.httpsProject
    default:
      throw new InternalError(`Unknown https app subtype ${appType}`)
  }
}

export { getProjectForAppType }
