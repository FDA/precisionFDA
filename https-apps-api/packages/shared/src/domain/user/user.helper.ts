import { ErrorCodes, NotFoundError } from '../../errors'
import { User } from './user.entity'

// right now, we run everything under user private project
const getProjectToRunApp = (user: User): string => {
  const projectId = user.privateFilesProject
  if (!projectId) {
    throw new NotFoundError('Private project is not set for given user', {
      code: ErrorCodes.PROJECT_NOT_FOUND,
    })
  }
  return projectId
}

export { getProjectToRunApp }
