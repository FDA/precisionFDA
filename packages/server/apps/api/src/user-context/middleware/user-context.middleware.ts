import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { Session } from '@shared/domain/session/session.entity'
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
    let userContext = new UserContext(null, null, null)
    if (CookieUtils.testCookieByKey(COOKIE_SESSION_KEY, req.headers.cookie)) {
      const token = CookieUtils.getCookie(COOKIE_SESSION_KEY, req.headers.cookie)
      let userSession: UserSession
      try {
        userSession = Encryptor.decrypt(token)
      } catch (error) {
        this.logger.error(error)
        throw new UnauthorizedRequestError()
      }

      // when user has not logged in yet, there is still a session, but it does not exist in the database
      // at that time, the decrypted object does not have user_id
      if (userSession?.user_id) {
        const session = await this.em.findOne(Session, {
          key: HashUtils.hashSessionId(userSession.session_id),
          user: userSession.user_id,
        })
        if (!session) {
          throw new UnauthorizedRequestError()
        }

        if (session.isExpired() || !this.isValidSessionExpiration(userSession)) {
          throw new UnauthorizedRequestError()
        }

        session.updatedAt = new Date()
        await this.em.flush()
        res.cookie('sessionExpiredAt', session.expiredAt(), {
          secure: true,
        })
        userContext = new UserContext(userSession.user_id, userSession.token, userSession.username)
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
    } else if (req.headers.authorization) {
      const token = new RegExp(/^Key (.+)$/).exec(req.headers.authorization)?.[1]
      let userSession: CliUserSession
      try {
        userSession = CliEncryptor.decrypt(token)
      } catch (error) {
        this.logger.error(error)
        throw new UnauthorizedRequestError()
      }

      if (!this.isValidSessionExpiration(userSession)) {
        throw new UnauthorizedRequestError()
      }

      userContext = new UserContext(userSession.user_id, userSession.token, userSession.username)
    }

    userContextStorage.run(userContext, next)
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
