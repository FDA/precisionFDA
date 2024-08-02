import crypto from 'crypto'

export class HashUtils {
  private static ID_VERSION = 2

  static hashSessionId(sessionId: string) {
    return `${this.ID_VERSION}::${crypto.createHash('sha256').update(sessionId).digest('hex')}`
  }
}