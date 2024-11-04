import { config } from '@shared/config'
import crypto from 'crypto'
import Marshal from 'marshal'
import { SecurityUtils } from '../security.utils'

export type CliUserSession = {
  user_id: number
  username: string
  token: string
  expiration: number
  org_id: number
}

export class CliEncryptor {
  private static readonly algorithm = 'aes-256-cbc'
  private static readonly secretKeyBase = config.secretKeyBase
  private static readonly iterations = 1000
  private static readonly keySize = 32
  private static readonly digest = 'sha256'
  private static readonly encryptedCookieSalt = 'encrypted cookie'
  private static readonly encryptedSignedCookieSalt = 'signed encrypted cookie'

  private static get derivedKey() {
    return crypto.pbkdf2Sync(
      this.secretKeyBase,
      this.encryptedCookieSalt,
      this.iterations,
      this.keySize,
      this.digest,
    )
  }

  private static get signedSecretKey() {
    return crypto.pbkdf2Sync(
      this.secretKeyBase,
      this.encryptedSignedCookieSalt,
      this.iterations,
      this.keySize * 2,
      this.digest,
    )
  }

  private static validateToken = (data: string, digest: string) => {
    const hmac = crypto.createHmac('sha256', this.signedSecretKey)
    hmac.update(data)
    return SecurityUtils.secureCompare(hmac.digest(), Buffer.from(digest, 'hex'))
  }

  static decrypt(token: string): CliUserSession {
    try {
      const [data, digest] = token.split('--')

      if (!this.validateToken(data, digest)) {
        throw new Error('Invalid token')
      }

      const decodedToken = Buffer.from(data, 'base64').toString('utf8')
      const [encryptedValue, iv] = decodedToken.split('--')
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.derivedKey,
        Buffer.from(iv, 'base64'),
      )
      let dec = decipher.update(encryptedValue, 'base64', 'hex')
      dec += decipher.final('hex')

      const m = new Marshal(dec, 'hex')
      return JSON.parse(m.parsed).context
    } catch (error) {
      throw new Error(`Failed to decrypt token: ${error}`)
    }
  }
}
