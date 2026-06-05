import crypto from 'node:crypto'
import { Controller, Get, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { COOKIE_SESSION_KEY } from '@shared/config/consts'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { CSRFUtils } from '@shared/utils/csrf.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'

@Controller('/csrf-token')
export class CsrfTokenController {
  @Get()
  getCsrfToken(@Req() req: Request, @Res() res: Response): void {
    const cookie = CookieUtils.getCookie(COOKIE_SESSION_KEY, req.headers.cookie)
    if (!cookie) {
      res.json({ token: null })
      return
    }
    try {
      const session = Encryptor.decrypt(cookie)
      if (!session) {
        res.json({ token: null })
        return
      }

      if (!session._csrf_token) {
        // Generate a _csrf_token if Rails hasn't set one yet.
        // This matches Rails' behavior: a 32-byte random value, base64-encoded.
        session._csrf_token = crypto.randomBytes(32).toString('base64')
        const encryptedSession = Encryptor.encrypt(session)
        res.cookie(COOKIE_SESSION_KEY, encryptedSession, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
        })
      }

      res.json({ token: CSRFUtils.generateToken(session._csrf_token) })
    } catch {
      res.json({ token: null })
    }
  }
}
