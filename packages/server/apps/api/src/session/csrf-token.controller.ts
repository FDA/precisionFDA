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
    let rawCookie = null
    if (req.headers.cookie) {
      rawCookie = CookieUtils.getCookie(COOKIE_SESSION_KEY, req.headers.cookie)
    }

    if (!rawCookie) {
      this.bootstrapSession(res)
      return
    }

    try {
      const session = Encryptor.decrypt(rawCookie)
      if (!session) {
        res.json({ token: null })
        return
      }

      if (!session._csrf_token) {
        // Generate a _csrf_token if Rails hasn't set one yet.
        // This matches Rails' behavior: a 32-byte random value, base64-encoded.
        session._csrf_token = crypto.randomBytes(32).toString('base64')
        this.setSessionCookie(res, Encryptor.encrypt(session))
      }

      res.json({ token: CSRFUtils.generateToken(session._csrf_token) })
    } catch {
      res.json({ token: null })
    }
  }

  /**
   * No session cookie present — nginx now serves index.html directly without
   * going through Rails, so no session is initialised on first visit.
   * Bootstrap a minimal one, mirroring what Rails used to do.
   */
  private bootstrapSession(res: Response): void {
    const csrfToken = crypto.randomBytes(32).toString('base64')
    const sessionId = crypto.randomBytes(32).toString('hex')
    this.setSessionCookie(res, Encryptor.encrypt({ session_id: sessionId, _csrf_token: csrfToken }))
    res.json({ token: CSRFUtils.generateToken(csrfToken) })
  }

  private setSessionCookie(res: Response, encryptedSession: string): void {
    res.cookie(COOKIE_SESSION_KEY, encryptedSession, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
  }
}
