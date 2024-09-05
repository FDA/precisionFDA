import { config } from '@shared/config'
import crypto from 'crypto'

interface RailsToken {
  _rails: {
    message: string
    exp?: string
    pur: string
  }
}

interface UserSession {
  session_id: string
  user_id: number
  username: string
  token: string
  expiration: number
  org_id: number
  _csrf_token: string
}

/**
 * Reimplementation of the encryptor for cookie in Rails
 */
export class Encryptor {
  private static readonly algorithm = 'aes-256-gcm'
  private static readonly secretKeyBase = config.secretKeyBase
  private static readonly authEncryptedCookie = 'authenticated encrypted cookie'
  private static readonly digest = 'sha1'
  private static readonly iterations = 1000
  private static readonly keySize = 32

  static get derivedKey() {
    return crypto.pbkdf2Sync(
      this.secretKeyBase,
      this.authEncryptedCookie,
      this.iterations,
      this.keySize,
      this.digest,
    )
  }

  /**
   * @param token cookie token in URI encoded format
   * @returns
   */
  static decrypt(token: string): UserSession {
    try {
      const data = decodeURIComponent(token)
      const [encryptedValue, iv, authTag] = data.split('--')

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.derivedKey,
        Buffer.from(iv, 'base64'),
      )
      decipher.setAuthTag(Buffer.from(authTag, 'base64'))

      let deccrypted = decipher.update(encryptedValue, 'base64', 'utf8')
      deccrypted += decipher.final('utf8')

      const deccryptedObj = JSON.parse(deccrypted) as RailsToken
      const message = deccryptedObj._rails.message
      const session = Buffer.from(message, 'base64').toString('utf8')
      return JSON.parse(session) as UserSession
    } catch (error) {
      throw new Error(`Failed to decrypt token: ${error}`)
    }
  }
}
