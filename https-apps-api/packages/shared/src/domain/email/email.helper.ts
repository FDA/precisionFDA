import fs from 'fs'
import path from 'path'
import mjml2html from 'mjml'
import { isNil } from 'ramda'
import { SpaceMembership, User } from '..'
import { Maybe, OpsCtx } from '../../types'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import {
  EmailConfigItem,
  EmailSendInput,
  NOTIFICATION_ROLE_PREFIXES,
  NOTIFICATION_TYPES_BASE,
  NOTIFICATION_TYPES,
} from './email.config'

type EmailHelperCtx = OpsCtx & {
  config: EmailConfigItem
}

// use this for spaceEvent type of emails
const getKeyForUserSpaceRole = (
  membership: SpaceMembership,
  // spaceEvent?: SpaceEvent,
  keyBase: keyof typeof NOTIFICATION_TYPES_BASE,
): string => {
  let prefix: string
  switch (membership.role) {
    case SPACE_MEMBERSHIP_ROLE.ADMIN:
      prefix = NOTIFICATION_ROLE_PREFIXES.spaceAdmin
      break
    case SPACE_MEMBERSHIP_ROLE.LEAD:
      prefix = NOTIFICATION_ROLE_PREFIXES.spaceLead
      break
    default:
      prefix = NOTIFICATION_ROLE_PREFIXES.spaceMember
  }
  return `${prefix}_${keyBase}`
}

// also for spaceEvent emails
const buildIsNotificationEnabled = (
  notificationKeyBase: keyof typeof NOTIFICATION_TYPES_BASE,
  ctx: OpsCtx,
) => (membership: SpaceMembership): boolean => {
  const { log } = ctx
  const user = membership.user.unwrap()
  const userConfig = isNil(user.emailNotificationSettings)
    ? null
    : user.emailNotificationSettings.unwrap()
  const notificationKey = getKeyForUserSpaceRole(membership, notificationKeyBase)
  if (!Object.keys(NOTIFICATION_TYPES).includes(notificationKey)) {
    // notification TYPE does not even exist, we cannot send the email
    return false
  }
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
) => (memberships: SpaceMembership[]): User[] => {
  const { log, config } = ctx
  const filtered = memberships.filter(membership => {
    const emailTypeIsEnabled = isEnabledFn(membership)
    if (!emailTypeIsEnabled) {
      log.info(
        { receiverId: membership.user.id, emailTypeId: config.emailId },
        'Skipping email type for user because of their config',
      )
    }
    return emailTypeIsEnabled
  })
  return filtered.map(membership => membership.user.unwrap())
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

export {
  saveEmailToFile,
  buildIsNotificationEnabled,
  buildFilterByUserSettings,
  getKeyForUserSpaceRole,
  buildEmailTemplate,
}
