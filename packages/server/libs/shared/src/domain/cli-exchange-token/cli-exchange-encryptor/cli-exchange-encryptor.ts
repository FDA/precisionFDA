import * as crypto from 'crypto'

export class CliExchangeEncryptor {
  private static readonly algorithm = 'aes-256-gcm'
  private static readonly keyLength = 32
  private static readonly ivLength = 16
  private static readonly tagLength = 16

  /**
   * Encrypts a CLI key using AES-256-GCM encryption
   * @param data The CLI key to encrypt
   * @param secretKey The secret key for encryption
   * @param salt The salt to use for encryption
   * @returns Encrypted CLI key with IV and auth tag
   */
  static encrypt(data: string, secretKey: string, salt: string): string {
    try {
      const key = this.getEncryptionKey(secretKey)
      const iv = crypto.randomBytes(this.ivLength)

      const cipher = crypto.createCipheriv(this.algorithm, key, iv)
      cipher.setAAD(Buffer.from(salt))

      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const authTag = cipher.getAuthTag()

      const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')])

      return combined.toString('base64')
    } catch (error) {
      throw new Error(`CLI key encryption failed ${error.message}`)
    }
  }

  /**
   * Decrypts an encrypted CLI key
   * @param encryptedCliKey The encrypted CLI key to decrypt
   * @param secretKey The secret key for decryption
   * @param salt The salt used during encryption
   * @returns Decrypted CLI key
   */
  static decrypt(encryptedCliKey: string, secretKey: string, salt: string): string {
    try {
      const key = this.getEncryptionKey(secretKey)
      const combined = Buffer.from(encryptedCliKey, 'base64')

      const iv = combined.subarray(0, this.ivLength)
      const authTag = combined.subarray(this.ivLength, this.ivLength + this.tagLength)
      const encrypted = combined.subarray(this.ivLength + this.tagLength)

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
      decipher.setAAD(Buffer.from(salt))
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encrypted, null, 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error(`CLI key decryption failed ${error.message}`)
    }
  }

  /**
   * Gets the encryption key from provided key
   * @param secretKey Secret key to use
   * @returns Encryption key as Buffer
   */
  private static getEncryptionKey(secretKey: string): Buffer {
    if (!secretKey) {
      throw new Error('No encryption secret key provided')
    }

    // Ensure key is exactly 32 bytes for AES-256
    if (secretKey.length === this.keyLength * 2) {
      // Key is already hex encoded
      return Buffer.from(secretKey, 'hex')
    }

    // Hash the key to get consistent 32 bytes
    return crypto.createHash('sha256').update(secretKey).digest()
  }
}
