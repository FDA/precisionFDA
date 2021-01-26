import { APP_HTTPS_SUBTYPE } from '../app/app.enum'
import { ErrorCodes, InternalError, NotFoundError } from '../../errors'
import { User } from './user.entity'

const getProjectForAppTypeFromDb = (user: User, appType: APP_HTTPS_SUBTYPE): string | null => {
  switch (appType) {
    case APP_HTTPS_SUBTYPE.JUPYTER:
      return user.jupyterProject
    case APP_HTTPS_SUBTYPE.TTYD:
      return user.ttydProject
    // case APP_HTTPS_SUBTYPE.SHINY:
    //   // fixme:
    //   return user.ttydProject
    // case APP_HTTPS_SUBTYPE.CLOUDWS:
    //   return user.cloudWorkstationProject
    // case APP_HTTPS_SUBTYPE.CUSTOM:
    //   return user.httpsProject
    default:
      throw new InternalError(`Unknown https app subtype ${appType}`)
  }
}

const getProjectForAppType = (user: User, appType: APP_HTTPS_SUBTYPE): string => {
  const projectId = getProjectForAppTypeFromDb(user, appType)
  if (!projectId) {
    throw new NotFoundError(`Project of app type ${appType} is not set for given user`, {
      code: ErrorCodes.PROJECT_NOT_FOUND,
    })
  }
  return projectId
}

export { getProjectForAppType }
