import { ErrorCodes, NotFoundError } from '../../errors'
import { ORG_HANDLE_MAX_LENGTH, PFDA_PREFIX } from '../org/org.utils'
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

const constructUsername = (first: string, last: string) => {
  return `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase().replace(/[^a-z]/g, '')}`
}

const constructOrgFromUsername = (username: string) => {
  const RESERVED_SIZE = 4 // 3 digits plus 1 dot
  return {
    orgName: username.replace(/\./g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    orgBaseHandle: username
      .replace(/\./, '')
      .substring(0, ORG_HANDLE_MAX_LENGTH - PFDA_PREFIX.length - RESERVED_SIZE),
  }
}

const isGovEmail = (email: string): boolean => {
  const emailDomain = email.split('@').pop()
  return ['fda.hhs.gov', 'fda.gov'].includes(emailDomain)
}

export { constructOrgFromUsername, constructUsername, getProjectToRunApp, isGovEmail }
