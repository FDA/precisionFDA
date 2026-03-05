import { dump, load } from '@hyrious/marshal'
import { config } from '@shared/config'
import crypto from 'crypto'
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

  private static get derivedKey(): Buffer {
    return crypto.pbkdf2Sync(
      this.secretKeyBase,
      this.encryptedCookieSalt,
      this.iterations,
      this.keySize,
      this.digest,
    )
  }

  private static get signedSecretKey(): Buffer {
    return crypto.pbkdf2Sync(
      this.secretKeyBase,
      this.encryptedSignedCookieSalt,
      this.iterations,
      this.keySize * 2,
      this.digest,
    )
  }

  private static validateToken = (data: string, digest: string): boolean => {
    const hmac = crypto.createHmac('sha256', this.signedSecretKey)
    hmac.update(data)
    return SecurityUtils.secureCompare(hmac.digest(), Buffer.from(digest, 'hex'))
  }

  static encrypt(session: CliUserSession): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(this.algorithm, this.derivedKey, iv)
      let encrypted = cipher.update(
        Buffer.from(dump(JSON.stringify({ context: session }))).toString('hex'),
        'hex',
        'base64',
      )
      encrypted += cipher.final('base64')
      const data = `${encrypted}--${iv.toString('base64')}`
      const token = Buffer.from(data).toString('base64')
      const hmac = crypto.createHmac('sha256', this.signedSecretKey)
      hmac.update(token)
      const digest = hmac.digest()
      return `${token}--${Buffer.from(digest).toString('hex')}`
    } catch (error) {
      throw new Error(`Failed to encrypt token: ${error}`)
    }
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

      return JSON.parse(load(Buffer.from(dec, 'hex')) as string).context
    } catch (error) {
      throw new Error(`Failed to decrypt token: ${error}`)
    }
  }
}
