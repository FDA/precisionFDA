import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { CliExchangeEncryptor } from '@shared/domain/cli-exchange-token/cli-exchange-encryptor/cli-exchange-encryptor'
import { CliExchangeToken } from '@shared/domain/cli-exchange-token/cli-exchange-token.entity'
import { CliExchangeTokenService } from '@shared/domain/cli-exchange-token/services/cli-exchange-token.service'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { CliExchangeFacade } from '@shared/facade/cli-exchange/cli-exchange.facade'
import { PlatformClient } from '@shared/platform-client'
import { TimeUtils } from '@shared/utils/time.utils'

describe('CliExchangeFacade tests', () => {
  const flushStub = stub()
  const removeStub = stub()
  const jobDescribeStub = stub()
  const getExchangeCliTokenByCodeStub = stub()

  const em = {
    flush: flushStub,
    remove: removeStub,
  } as unknown as SqlEntityManager
  const adminClient = {
    jobDescribe: jobDescribeStub,
  } as unknown as PlatformClient
  const cliExchangeTokenService = {
    getExchangeCliTokenByCode: getExchangeCliTokenByCodeStub,
  } as unknown as CliExchangeTokenService

  const PRIVATE_EXCHANGE_TOKEN = {
    id: 1,
    dxid: 'job-uid-123',
    code: 'private-exchange-code',
    expiresAt: new Date(Date.now() + TimeUtils.minutesToMilliseconds(5)),
    encryptedKey: CliExchangeEncryptor.encrypt('private-key', config.job.tokenEncryptionKey, 'private-salt'),
    scope: STATIC_SCOPE.PRIVATE,
    salt: 'private-salt',
  } as unknown as CliExchangeToken

  const PRIVATE_JOB_CONFIGS = CliExchangeEncryptor.decrypt(
    PRIVATE_EXCHANGE_TOKEN.encryptedKey,
    config.job.tokenEncryptionKey,
    PRIVATE_EXCHANGE_TOKEN.salt,
  )

  const SPACE_EXCHANGE_TOKEN = {
    id: 2,
    dxid: 'job-uid-456',
    code: 'space-exchange-code',
    expiresAt: new Date(Date.now() + TimeUtils.minutesToMilliseconds(5)),
    encryptedKey: CliExchangeEncryptor.encrypt('space-key', config.job.tokenEncryptionKey, 'space-salt'),
    scope: 'space-1',
    salt: 'space-salt',
  } as unknown as CliExchangeToken

  const SPACE_JOB_CONFIGS = CliExchangeEncryptor.decrypt(
    SPACE_EXCHANGE_TOKEN.encryptedKey,
    config.job.tokenEncryptionKey,
    SPACE_EXCHANGE_TOKEN.salt,
  )

  beforeEach(() => {
    removeStub.reset()
    removeStub.returns(em)
    flushStub.reset()
    flushStub.resolves()

    jobDescribeStub.reset()
    getExchangeCliTokenByCodeStub.reset()
    getExchangeCliTokenByCodeStub
      .withArgs(PRIVATE_EXCHANGE_TOKEN.code)
      .resolves(PRIVATE_EXCHANGE_TOKEN)
      .withArgs(SPACE_EXCHANGE_TOKEN.code)
      .resolves(SPACE_EXCHANGE_TOKEN)
  })

  context('exchangeCLIToken', () => {
    it('should return token and remove exchange token for private scope', async () => {
      const facade = getInstance()

      const result = await facade.exchangeCLIToken(PRIVATE_EXCHANGE_TOKEN.code)
      expect(result).to.deep.equal({
        exchangeToken: Buffer.from(PRIVATE_JOB_CONFIGS).toString('base64'),
      })
      expect(removeStub.calledOnceWithExactly(PRIVATE_EXCHANGE_TOKEN)).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(jobDescribeStub.notCalled).to.be.true()
    })

    it('should validate job, return token and remove exchange token for space scope', async () => {
      jobDescribeStub.resolves({ state: JOB_STATE.RUNNING })

      const facade = getInstance()
      const result = await facade.exchangeCLIToken(SPACE_EXCHANGE_TOKEN.code)
      expect(result).to.deep.equal({
        exchangeToken: Buffer.from(SPACE_JOB_CONFIGS).toString('base64'),
      })
      expect(removeStub.calledOnceWithExactly(SPACE_EXCHANGE_TOKEN)).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
      expect(jobDescribeStub.calledOnceWithExactly({ jobDxId: SPACE_EXCHANGE_TOKEN.dxid })).to.be.true()
    })

    it('should throw error if job is not in running state', async () => {
      jobDescribeStub.resolves({ state: JOB_STATE.RUNNABLE })
      const facade = getInstance()
      await expect(facade.exchangeCLIToken(SPACE_EXCHANGE_TOKEN.code)).to.be.rejectedWith(
        InvalidStateError,
        'Job is not in running state',
      )
      expect(removeStub.notCalled).to.be.true()
      expect(flushStub.notCalled).to.be.true()
      expect(jobDescribeStub.calledOnceWithExactly({ jobDxId: SPACE_EXCHANGE_TOKEN.dxid })).to.be.true()
    })
  })

  function getInstance(): CliExchangeFacade {
    return new CliExchangeFacade(em, adminClient, cliExchangeTokenService)
  }
})
