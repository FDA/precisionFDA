import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { TASK_TYPE } from '@shared/queue/task.input'
import mjml2html from 'mjml'
import { isNil } from 'ramda'
import { Maybe, OpsCtx } from '../../types'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import {
  EmailConfigItem,
  NOTIFICATION_ROLE,
  NOTIFICATION_TYPES_BASE,
  NOTIFICATION_TYPES,
} from './email.config'
import { nanoid } from 'nanoid'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { Space } from '@shared/domain/space/space.entity'

type EmailHelperCtx = OpsCtx & {
  config: EmailConfigItem
}

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

const getKeyForPrivateEvent = (keyBase: keyof typeof NOTIFICATION_TYPES_BASE): string => {
  const prefix = NOTIFICATION_ROLE.privateScope
  return `${prefix}_${keyBase}`
}

// also for spaceEvent emails
const buildIsNotificationEnabled =
  (notificationKeyBase: keyof typeof NOTIFICATION_TYPES_BASE, ctx: OpsCtx) =>
  (membershipOrUser: SpaceMembership | User): boolean => {
    const { log } = ctx
    let user: User
    let notificationKey: string
    if (membershipOrUser instanceof User) {
      user = membershipOrUser
      notificationKey = getKeyForPrivateEvent(notificationKeyBase)
    } else if (membershipOrUser instanceof SpaceMembership) {
      user = membershipOrUser.user.unwrap()
      notificationKey = getKeyForUserSpaceRole(membershipOrUser, notificationKeyBase)
    } else {
      throw new Error('Invalid entity type - required User or SpaceMembership')
    }

    const userConfig = isNil(user.notificationPreference)
      ? null
      : user.notificationPreference.unwrap()
    if (!Object.keys(NOTIFICATION_TYPES).includes(notificationKey)) {
      // notification TYPE does not even exist, we cannot send the email
      return false
    }
    // TODO(samuel) remove fallback option when all users have notifications settings created - Create migration
    // for now, we know all default values are set to true
    const defaultValue = true
    if (isNil(userConfig) || isNil(userConfig.data)) {
      log.debug(
        { userId: user.id, key: notificationKey },
        'Notifications object not found, applying default',
      )
      return defaultValue
    }
    // const dbValues = notificationsConfig.data
    const settingValue: Maybe<boolean> = userConfig.data[notificationKey]
    if (isNil(settingValue)) {
      log.debug(
        { emailNotificationsConfigId: userConfig.id, key: notificationKey, userId: user.id },
        'Notification key not found in user preferences, applying default',
      )
      return defaultValue
    }
    log.debug(
      {
        userId: user.id,
        emailNotificationsConfigId: userConfig.id,
        key: notificationKey,
        value: settingValue,
      },
      'Applying notification value found in the db',
    )
    return settingValue
  }

// needs space membership, fixme: rename accordingly
const buildFilterByUserSettings =
  (ctx: EmailHelperCtx, isEnabledFn: ReturnType<typeof buildIsNotificationEnabled>) =>
  (membershipOrUsers: Array<SpaceMembership | User>): User[] => {
    const { log, config } = ctx
    const filtered = membershipOrUsers.filter((membershipOrUser) => {
      const emailTypeIsEnabled = isEnabledFn(membershipOrUser)
      if (!emailTypeIsEnabled) {
        const userId =
          membershipOrUser instanceof SpaceMembership
            ? membershipOrUser.user.id
            : membershipOrUser.id
        log.log(
          {
            receiverId: userId,
            emailTypeId: config.emailId,
          },
          'Skipping email type for user because of their config',
        )
      }
      return emailTypeIsEnabled
    })
    return filtered.map((membershipOrUser) =>
      membershipOrUser instanceof SpaceMembership
        ? membershipOrUser.user.unwrap()
        : membershipOrUser,
    )
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

export {
  pfdaNoReplyUser,
  buildIsNotificationEnabled,
  buildFilterByUserSettings,
  getKeyForUserSpaceRole,
  buildEmailTemplate,
  getBullJobIdForEmailOperation,
}
