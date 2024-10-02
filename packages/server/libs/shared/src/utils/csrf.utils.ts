import crypto from 'crypto'
import { SecurityUtils } from './security.utils'

export class CSRFUtils {
  private static readonly AUTHENTICITY_TOKEN_LENGTH = 32
  private static readonly GLOBAL_CSRF_TOKEN_IDENTIFIER = '!real_csrf_token'

  private static xorByteString(s1: Buffer, s2: Buffer): Buffer {
    s2 = s2.subarray()
    const size = s1.length
    let i = 0
    while (i < size) {
      s2[i] = s1[i] ^ s2[i]
      i++
    }
    return s2
  }

  private static unmaskedCsrfToken(authToken: string): Buffer {
    const maskedToken = Buffer.from(authToken, 'base64')
    const oneTimePad = maskedToken.subarray(0, this.AUTHENTICITY_TOKEN_LENGTH)
    const encryptedCsrf = maskedToken.subarray(this.AUTHENTICITY_TOKEN_LENGTH, maskedToken.length)
    return this.xorByteString(oneTimePad, encryptedCsrf)
  }

  private static csrfTokenHmac(csrfToken: Buffer): Buffer {
    const hmac = crypto.createHmac('sha256', csrfToken)
    hmac.update(this.GLOBAL_CSRF_TOKEN_IDENTIFIER)
    return hmac.digest()
  }

  static verifyToken(authToken: string, csrfToken: string): boolean {
    if (!authToken || !csrfToken) {
      return false
    }

    const unmaskedCsrfToken = this.unmaskedCsrfToken(authToken)
    const csrfTokenHmac = this.csrfTokenHmac(Buffer.from(csrfToken, 'base64'))
    return SecurityUtils.secureCompare(unmaskedCsrfToken, csrfTokenHmac)
  }

  static generateToken(csrfToken: string): string {
    const oneTimePad = crypto.randomBytes(this.AUTHENTICITY_TOKEN_LENGTH)
    const csrfTokenHmac = this.csrfTokenHmac(Buffer.from(csrfToken, 'base64'))
    const encryptedCsrf = this.xorByteString(oneTimePad, csrfTokenHmac)
    const maskedToken = Buffer.concat([oneTimePad, encryptedCsrf])
    return Buffer.from(maskedToken).toString('base64')
  }
}
