import * as crypto from 'node:crypto'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScope } from '@shared/types/common'
import { TimeUtils } from '@shared/utils/time.utils'
import { CliExchangeToken } from '../cli-exchange-token.entity'
import { CliExchangeTokenRepository } from '../cli-exchange-token.repository'

@Injectable()
export class CliExchangeTokenService {
  private readonly TOKEN_VALIDITY_MINUTES = 5
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly cliExchangeTokenRepository: CliExchangeTokenRepository,
  ) {}

  async createNewToken(encryptedKey: string, scope: EntityScope, salt: string): Promise<CliExchangeToken> {
    const token = new CliExchangeToken()
    token.code = crypto.randomBytes(32).toString('hex')
    token.expiresAt = new Date(Date.now() + TimeUtils.minutesToMilliseconds(this.TOKEN_VALIDITY_MINUTES))
    token.encryptedKey = encryptedKey
    token.scope = scope
    token.salt = salt
    await this.em.persist(token).flush()
    return token
  }

  async getExchangeCliTokenByCode(code: string): Promise<CliExchangeToken> {
    const exchangeToken = await this.cliExchangeTokenRepository.findOne({ code })
    if (!exchangeToken) {
      this.logger.warn(`No CLI exchange token found for code: ${code}`)
      throw new NotFoundError('Invalid CLI Authorization code')
    }
    if (exchangeToken.expiresAt < new Date()) {
      this.logger.warn(`CLI exchange token expired for job dxid: ${exchangeToken.dxid}`)
      await this.em.remove(exchangeToken).flush()
      throw new InvalidStateError('CLI Authorization code has expired')
    }

    return exchangeToken
  }

  async deleteToken(code: string): Promise<void> {
    const token = await this.cliExchangeTokenRepository.findOne({ code })
    if (token) {
      await this.em.remove(token).flush()
    }
  }
}
