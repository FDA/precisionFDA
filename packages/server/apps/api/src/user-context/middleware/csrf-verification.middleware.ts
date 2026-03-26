import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { PermissionError } from '@shared/errors'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { CSRFUtils } from '@shared/utils/csrf.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { NextFunction, Request, Response } from 'express'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class CSRFVerificationMiddleware implements NestMiddleware {
  @ServiceLogger()
  private readonly logger: Logger

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!config.api.enableForgeryProtection) {
      return next()
    }

    const reqMethod = req.method.toLowerCase()
    const isReqWithCookie = CookieUtils.testCookieByKey(COOKIE_SESSION_KEY, req.headers.cookie)
    if (['get', 'options'].includes(reqMethod) || (!isReqWithCookie && req.headers.authorization)) {
      return next()
    }
    const token = CookieUtils.getCookie(COOKIE_SESSION_KEY, req.headers.cookie)
    const userSession = Encryptor.decrypt(token)

    const reqCsrfToken = req.headers[USER_CONTEXT_HTTP_HEADERS.csrfToken] as string
    const csrfToken = userSession?._csrf_token
    const isValidCsrfToken = CSRFUtils.verifyToken(reqCsrfToken, csrfToken)
    if (!isValidCsrfToken) {
      this.logger.warn('CSRF verification failed', {
        reqMethod,
        hasSessionCookie: isReqWithCookie,
        authHeader: !!req.headers.authorization,
        receivedToken: `${reqCsrfToken?.slice(0, 6)}…`,
        expectedToken: `${csrfToken?.slice(0, 6)}…`,
        userSessionDecrypted: Boolean(userSession),
      })

      throw new PermissionError()
    }
    next()
  }
}
