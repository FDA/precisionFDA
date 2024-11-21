import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { Session } from '@shared/domain/session/session.entity'
import { UnauthorizedUserContext } from '@shared/domain/user-context/model/unauthorized-user-context'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { UnauthorizedRequestError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { CliEncryptor, CliUserSession } from '@shared/utils/encryptors/cli-encryptor'
import { Encryptor, UserSession } from '@shared/utils/encryptors/encryptor'
import { HashUtils } from '@shared/utils/hash.utils'
import { TimeUtils } from '@shared/utils/time.utils'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly em: SqlEntityManager) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userContext =
      (await this.getUserContextFromSessionCookie(req, res)) ??
      (await this.getUserContextFromAuthHeader(req)) ??
      new UnauthorizedUserContext()

    userContextStorage.run(userContext, next)
  }

  private async getUserContextFromSessionCookie(req: Request, res: Response): Promise<UserContext> {
    if (!CookieUtils.testCookieByKey(COOKIE_SESSION_KEY, req.headers.cookie)) {
      return null
    }

    const token = CookieUtils.getCookie(COOKIE_SESSION_KEY, req.headers.cookie)
    let userSession: UserSession
    try {
      userSession = Encryptor.decrypt(token)
    } catch (error) {
      this.logger.error(error)
      throw new UnauthorizedRequestError()
    }

    if (!this.isValidSessionExpiration(userSession)) {
      return null
    }

    const userAgent = req.headers[USER_CONTEXT_HTTP_HEADERS.userAgent]
    if (userAgent !== 'Ruby') {
      const newToken = Encryptor.encrypt(userSession)
      res.cookie(COOKIE_SESSION_KEY, newToken, {
        httpOnly: true,
        secure: true,
        path: '/',
      })
    }

    // when user has not logged in yet, there is still a session, but it does not exist in the database
    // at that time, the decrypted object does not have user_id
    if (!userSession?.user_id) {
      return null
    }

    const session = await this.em.findOne(Session, {
      key: HashUtils.hashSessionId(userSession.session_id),
      user: userSession.user_id,
    })

    if (!session) {
      throw new UnauthorizedRequestError()
    }

    if (session.isExpired()) {
      return null
    }

    session.updatedAt = new Date()
    await this.em.flush()
    res.cookie('sessionExpiredAt', session.expiredAt(), {
      secure: true,
    })

    return new UserContext(
      userSession.user_id,
      userSession.token,
      userSession.username,
      userSession.session_id,
    )
  }

  private async getUserContextFromAuthHeader(req: Request): Promise<UserContext> {
    if (!req.headers.authorization) {
      return null
    }

    const token = new RegExp(/^Key (.+)$/).exec(req.headers.authorization)?.[1]
    let userSession: CliUserSession
    try {
      userSession = CliEncryptor.decrypt(token)
    } catch (error) {
      this.logger.error(error)
      throw new UnauthorizedRequestError()
    }

    if (!this.isValidSessionExpiration(userSession)) {
      return null
    }

    return new UserContext(userSession.user_id, userSession.token, userSession.username)
  }

  private isValidSessionExpiration(session: UserSession | CliUserSession): boolean {
    // check expiration time of the session
    // if session is from cookie token, the value is platform token expiration time
    // if session is from cli token, the value is cli expiration time
    return (
      session.expiration &&
      TimeUtils.secondsToMilliseconds(session.expiration) - Date.now() >
        TimeUtils.minutesToMilliseconds(config.minusExpirationMinutes)
    )
  }
}
