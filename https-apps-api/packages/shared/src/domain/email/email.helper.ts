import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import { isNil } from 'ramda'
import { SpaceMembership, User } from '..'
import { Maybe, OpsCtx } from '../../types'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../space-membership/space-membership.enum'
import {
  EmailConfigItem,
  EmailSendInput,
  NOTIFICATION_ROLE_PREFIXES,
  NOTIFICATION_TYPES_BASE,
  NOTIFICATION_TYPES,
  EMAIL_TYPES,
} from './email.config'
import { types } from '../../queue'
import { nanoid } from 'nanoid'

type EmailHelperCtx = OpsCtx & {
  config: EmailConfigItem
}

// is not a regular user but we still want to send some notifications to it
// all templates uses only firstName
const pfdaNoReplyUser = {
  firstName: 'precisionfda-no-reply',
  email: 'precisionfda-no-reply@dnanexus.com'
} as User


// use this for spaceEvent type of emails
const getKeyForUserSpaceRole = (
  membership: SpaceMembership,
  // spaceEvent?: SpaceEvent,
  keyBase: keyof typeof NOTIFICATION_TYPES_BASE,
): string => {
  let prefix: string
  if(membership.side === SPACE_MEMBERSHIP_SIDE.HOST) {
    switch (membership.role) {
      case SPACE_MEMBERSHIP_ROLE.ADMIN:
        prefix = NOTIFICATION_ROLE_PREFIXES.admin
        break
      case SPACE_MEMBERSHIP_ROLE.LEAD:
        prefix = NOTIFICATION_ROLE_PREFIXES.reviewer_lead
        break
      default:
        prefix = NOTIFICATION_ROLE_PREFIXES.reviewer
    }
  } else if(membership.side === SPACE_MEMBERSHIP_SIDE.GUEST) {
    switch (membership.role) {
      case SPACE_MEMBERSHIP_ROLE.ADMIN:
        prefix = NOTIFICATION_ROLE_PREFIXES.admin
        break
      case SPACE_MEMBERSHIP_ROLE.LEAD:
        prefix = NOTIFICATION_ROLE_PREFIXES.sponsor_lead
        break
      default:
        prefix = NOTIFICATION_ROLE_PREFIXES.sponsor
    }
  }
  // @ts-ignore
  return `${prefix}_${keyBase}`
}

const getKeyForPrivateEvent = (keyBase: keyof typeof NOTIFICATION_TYPES_BASE): string => {
  const prefix = NOTIFICATION_ROLE_PREFIXES.privateScope
  return `${prefix}_${keyBase}`
}

// also for spaceEvent emails
const buildIsNotificationEnabled = (
  notificationKeyBase: keyof typeof NOTIFICATION_TYPES_BASE,
  ctx: OpsCtx,
) => (membershipOrUser: SpaceMembership | User): boolean => {
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

  const userConfig = isNil(user.emailNotificationSettings)
    ? null
    : user.emailNotificationSettings.unwrap()
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
  // @ts-ignore
  const settingValue: Maybe<boolean> = userConfig.data[notificationKey]
  if (isNil(settingValue)) {
    log.debug(
      { emailNotificationsConfigId: userConfig.id, key: notificationKey, userId: user.id },
      'Notification key not found in user preferences, applying default',
    )
    return defaultValue
  }
  ctx.log.debug(
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
const buildFilterByUserSettings = (
  ctx: EmailHelperCtx,
  isEnabledFn: ReturnType<typeof buildIsNotificationEnabled>,
) => (membershipOrUsers: Array<SpaceMembership | User>): User[] => {
  const { log, config } = ctx
  const filtered = membershipOrUsers.filter(membershipOrUser => {
    const emailTypeIsEnabled = isEnabledFn(membershipOrUser)
    if (!emailTypeIsEnabled) {
      const userId =
        membershipOrUser instanceof SpaceMembership ? membershipOrUser.user.id : membershipOrUser.id
      log.info(
        {
          receiverId: userId,
          emailTypeId: config.emailId,
        },
        'Skipping email type for user because of their config',
      )
    }
    return emailTypeIsEnabled
  })
  return filtered.map(membershipOrUser =>
    membershipOrUser instanceof SpaceMembership ? membershipOrUser.user.unwrap() : membershipOrUser,
  )
}

const buildEmailTemplate = <N>(templateBuilder: (input: N) => string, payload: N): string => {
  const template = templateBuilder(payload)
  const processed = mjml2html(template)
  return processed.html
}

const saveEmailToFile = async (email: EmailSendInput, customFilename?: string): Promise<void> => {
  const filename = customFilename ?? 'test-email'
  const html = `
    <pre>email: ${email.to}\n
    subject: ${email.subject}\n</pre>
    ${email.body}`
  // todo: move path to config
  const targetPath = path.join(process.cwd(), 'test-emails', `${filename}.html`)
  await new Promise(done => fs.writeFile(targetPath, html, done))
}

const getBullJobIdForEmailOperation = (emailType: EMAIL_TYPES, customSuffix?: string): string => {
  const prefix = `${types.TASK_TYPE.SEND_EMAIL}.${EMAIL_TYPES[emailType]}`
  const suffix = customSuffix ?? nanoid()
  return `${prefix}.${suffix}`
}

export {
  pfdaNoReplyUser,
  saveEmailToFile,
  buildIsNotificationEnabled,
  buildFilterByUserSettings,
  getKeyForUserSpaceRole,
  buildEmailTemplate,
  getBullJobIdForEmailOperation,
}
