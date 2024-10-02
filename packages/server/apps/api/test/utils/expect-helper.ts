import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { BaseEntity } from '@shared/database/base.entity'
import { User } from '@shared/domain/user/user.entity'
import { CSRFUtils } from '@shared/utils/csrf.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { TimeUtils } from '@shared/utils/time.utils'
import crypto from 'crypto'
import { omit } from 'ramda'

const stripEntityDates = (entity: BaseEntity): Omit<BaseEntity, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

const generateCSRFToken = (user?: User) =>
  crypto.createHash('sha256').update(`csrf-token-${user?.id}`).digest('base64')

const generateCookieToken = (user?: User, expiration?: number) => {
  const csrfToken = generateCSRFToken(user)
  if (!user) {
    return Encryptor.encrypt({
      _csrf_token: csrfToken,
      session_id: '',
    })
  }

  const tokenExpiration =
    expiration ||
    TimeUtils.floorMilisecondsToSeconds(
      Date.now() + TimeUtils.minutesToMilliseconds(config.maxInactivityMinutes),
    )

  return Encryptor.encrypt({
    user_id: user.id,
    username: user.dxuser,
    token: 'fake-token',
    expiration: tokenExpiration,
    session_id: `session-id-${user.dxuser}`,
    org_id: 1,
    _csrf_token: csrfToken,
  })
}

const getCookieTokenString = (user?: User, expiration?: number) =>
  `${COOKIE_SESSION_KEY}=${generateCookieToken(user, expiration)}`

const getDefaultHeaderData = (user?: User) => ({
  cookie: getCookieTokenString(user),
  [USER_CONTEXT_HTTP_HEADERS.csrfToken]: CSRFUtils.generateToken(generateCSRFToken(user)),
})

export { generateCookieToken, getCookieTokenString, getDefaultHeaderData, stripEntityDates }
