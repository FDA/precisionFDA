import { Injectable, NestMiddleware } from '@nestjs/common'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { PermissionError } from '@shared/errors'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { CSRFUtils } from '@shared/utils/csrf.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class CSRFVerificationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
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
      throw new PermissionError()
    }
    next()
  }
}
