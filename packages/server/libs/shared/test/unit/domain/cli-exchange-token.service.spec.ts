import { SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { CliExchangeToken } from '@shared/domain/cli-exchange-token/cli-exchange-token.entity'
import { CliExchangeTokenRepository } from '@shared/domain/cli-exchange-token/cli-exchange-token.repository'
import { CliExchangeTokenService } from '@shared/domain/cli-exchange-token/services/cli-exchange-token.service'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { db } from '@shared/test'
import { TimeUtils } from '@shared/utils/time.utils'
import { expect } from 'chai'
import { useFakeTimers } from 'sinon'

describe('CliExchangeTokenService', () => {
  let em: SqlEntityManager
  let cliExchangeTokenRepository: CliExchangeTokenRepository

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as SqlEntityManager
    em.clear()
    cliExchangeTokenRepository = new CliExchangeTokenRepository(em, CliExchangeToken)
  })

  context('createNewToken', () => {
    it('creates and persists a new CLI exchange token', async () => {
      const service = getInstance()
      const encryptedKey = 'encrypted-key-sample'
      const scope = STATIC_SCOPE.PRIVATE
      const salt = 'random-salt-value'
      const instanceType = 'baseline-8'

      const now = Date.now()
      const clock = useFakeTimers({ now, toFake: ['Date'] })
      try {
        const token = await service.createNewToken(encryptedKey, scope, salt, instanceType)
        expect(token).to.have.property('id')
        expect(token).to.have.property('code')
        expect(token.encryptedKey).to.be.equal(encryptedKey)
        expect(token.scope).to.be.equal(scope)
        expect(token.expiresAt.getTime()).to.be.equal(
          now + TimeUtils.minutesToMilliseconds(service.CPU_TOKEN_VALIDITY_MINUTES),
        )

        const foundToken = await cliExchangeTokenRepository.findOne({
          id: token.id,
        })
        expect(foundToken).to.not.be.null()
        expect(foundToken.code).to.be.equal(token.code)
        expect(foundToken.salt).to.be.equal(salt)
      } finally {
        clock.restore()
      }
    })

    it('sets a longer expiration time for GPU instance types', async () => {
      const service = getInstance()
      const encryptedKey = 'encrypted-key-sample'
      const scope = STATIC_SCOPE.PRIVATE
      const salt = 'random-salt-value'
      const instanceType = 'gpu-8'

      const now = Date.now()
      const clock = useFakeTimers({ now, toFake: ['Date'] })
      try {
        const token = await service.createNewToken(encryptedKey, scope, salt, instanceType)
        expect(token).to.have.property('id')
        expect(token).to.have.property('code')
        expect(token.encryptedKey).to.be.equal(encryptedKey)
        expect(token.scope).to.be.equal(scope)
        expect(token.expiresAt.getTime()).to.be.equal(
          now + TimeUtils.minutesToMilliseconds(service.GPU_TOKEN_VALIDITY_MINUTES),
        )
      } finally {
        clock.restore()
      }
    })
  })

  context('getExchangeCliTokenByCode', () => {
    it('throws NotFoundError if token does not exist', async () => {
      const service = getInstance()
      const invalidCode = 'non-existent-code'

      await expect(service.getExchangeCliTokenByCode(invalidCode)).to.be.rejectedWith(
        NotFoundError,
        'Invalid CLI Authorization code',
      )
    })

    it('throws InvalidStateError if token has expired', async () => {
      const service = getInstance()
      const expiredToken = new CliExchangeToken()
      expiredToken.code = 'expired-code'
      expiredToken.expiresAt = new Date(Date.now() - 1000) // Set to past time
      expiredToken.encryptedKey = 'some-encrypted-key'
      expiredToken.scope = STATIC_SCOPE.PRIVATE
      expiredToken.salt = 'expired-salt'
      await em.persist(expiredToken).flush()

      await expect(service.getExchangeCliTokenByCode(expiredToken.code)).to.be.rejectedWith(
        'CLI Authorization code has expired',
      )
      expect(await cliExchangeTokenRepository.findOne({ id: expiredToken.id })).to.be.null()
    })

    it('returns the token if it exists and is valid', async () => {
      const service = getInstance()
      const validToken = new CliExchangeToken()
      validToken.code = 'valid-code'
      validToken.expiresAt = new Date(Date.now() + TimeUtils.minutesToMilliseconds(5)) // Set to future time
      validToken.encryptedKey = 'some-encrypted-key'
      validToken.scope = STATIC_SCOPE.PRIVATE
      validToken.salt = 'valid-salt'
      await em.persist(validToken).flush()

      const foundToken = await service.getExchangeCliTokenByCode(validToken.code)
      expect(foundToken).to.not.be.null()
      expect(foundToken.id).to.equal(validToken.id)
    })
  })

  function getInstance(): CliExchangeTokenService {
    return new CliExchangeTokenService(em, cliExchangeTokenRepository)
  }
})
