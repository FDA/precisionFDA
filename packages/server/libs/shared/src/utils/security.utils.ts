import crypto from 'node:crypto'

export class SecurityUtils {
  static secureCompare(bufferA: Buffer, bufferB: Buffer): boolean {
    if (bufferA.length !== bufferB.length) {
      return false
    }

    return crypto.timingSafeEqual(bufferA, bufferB)
  }
}
