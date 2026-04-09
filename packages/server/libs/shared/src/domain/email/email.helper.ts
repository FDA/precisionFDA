import mjml2html from 'mjml'
import { nanoid } from 'nanoid'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { TASK_TYPE } from '@shared/queue/task.input'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { NOTIFICATION_ROLE, NOTIFICATION_TYPES_BASE } from './email.config'

// is not a regular user, but we still want to send some notifications to it
// all templates uses only firstName
const pfdaNoReplyUser = {
  firstName: 'precisionfda-no-reply',
  email: 'precisionfda-no-reply@dnanexus.com',
  notificationPreference: {
    getEntity: () => ({
      data: {
        private_challenge_opened: true,
        private_challenge_preregister: true,
      },
    }),
  },
} as User

// use this for spaceEvent type of emails
const getKeyForUserSpaceRole = (
  membership: SpaceMembership,
  keyBase: keyof typeof NOTIFICATION_TYPES_BASE,
  space?: Space,
): string => {
  let spaceType: string | undefined
  let roleName: string

  if (space?.type === SPACE_TYPE.REVIEW) {
    spaceType = 'shared'
  } else if (space?.type === SPACE_TYPE.GROUPS) {
    spaceType = 'group'
  }

  switch (membership.role) {
    case SPACE_MEMBERSHIP_ROLE.ADMIN:
      roleName = NOTIFICATION_ROLE.admin
      break
    case SPACE_MEMBERSHIP_ROLE.LEAD:
      roleName = NOTIFICATION_ROLE.lead
      break
    case SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR:
      roleName = NOTIFICATION_ROLE.contributor
      break
    default:
      roleName = NOTIFICATION_ROLE.viewer
  }

  return `${spaceType ? `${spaceType}_` : ''}${roleName}_${keyBase}`
}

const buildEmailTemplate = <N>(templateBuilder: (input: N) => string, payload: N): string => {
  const template = templateBuilder(payload)
  const processed = mjml2html(template)
  return processed.html
}

const getBullJobIdForEmailOperation = (emailType: EMAIL_TYPES, customSuffix?: string): string => {
  const prefix = `${TASK_TYPE.SEND_EMAIL}.${EMAIL_TYPES[emailType]}`
  const suffix = customSuffix ?? nanoid()
  return `${prefix}.${suffix}`
}

export { buildEmailTemplate, getBullJobIdForEmailOperation, getKeyForUserSpaceRole, pfdaNoReplyUser }
