import * as crypto from 'crypto'
import { DataToEncrypt, EncryptedData } from '../db-cluster.enum'

declare const Buffer

export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex')
}

export const generatePassword = (secret: string, salt: string): string => {
  return crypto.pbkdf2Sync(secret, salt, 10000, 8, 'sha512').toString('hex')
}

export const encryptData = (data: DataToEncrypt, encryption_key: string): EncryptedData => {
  const jsonData = JSON.stringify(data)
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(encryption_key, salt, 32)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(jsonData, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    ciphertext: ciphertext.toString('base64'),
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}
