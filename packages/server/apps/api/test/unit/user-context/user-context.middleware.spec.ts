import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { SinonStub, stub } from 'sinon'
import { Session } from '@shared/domain/session/session.entity'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { UnauthorizedRequestError } from '@shared/errors'
import { CliEncryptor } from '@shared/utils/encryptors/cli-encryptor'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { HashUtils } from '@shared/utils/hash.utils'
import { TimeUtils } from '@shared/utils/time.utils'
import { UserContextMiddleware } from '../../../src/user-context/middleware/user-context.middleware'

describe('UserContextMiddleware', () => {
  let sessionExpirationMinutes: number

  const SESSION_ID = '123'
  const REQUEST_ID = nanoid()
  const USER_ID = 1
  const SESSION_EXPIRED_AT = 123
  const PLATFORM_TOKEN = 'platform_token'
  const USER_NAME = 'user_name'
  const VALID_TOKEN = 'VALID_SESSION_TOKEN'
  const VALID_CLI_KEY = 'VALID_CLI_KEY'
  const REFRESHED_TOKEN = 'REFRESHED_TOKEN'
  const VALID_AUTH_HEADER = `Key ${VALID_CLI_KEY}`
  const USER_SESSION = {
    session_id: SESSION_ID,
    _csrf_token: 'csrf_token',
    user_id: USER_ID,
    username: USER_NAME,
    token: PLATFORM_TOKEN,
    get expiration(): number {
      const now = new Date()
      const expirationDate = new Date(now.getTime() + TimeUtils.minutesToMilliseconds(sessionExpirationMinutes))

      return TimeUtils.floorMilisecondsToSeconds(expirationDate.getTime())
    },
    org_id: 10,
  }

  let userContextStorageRunStub: SinonStub
  let encryptorDecryptStub: SinonStub
  let encryptorEncryptStub: SinonStub
  let cliEncryptorDecryptStub: SinonStub
  const emFindOneStub = stub()
  const emFlushStub = stub()
  const nextStub = stub()
  const sessionIsExpiredStub = stub()
  const sessionExpiredAt = stub()
  const cookieStub = stub()

  const RESPONSE = { cookie: cookieStub } as unknown as Response

  const em = {
    findOne: emFindOneStub,
    flush: emFlushStub,
  } as unknown as SqlEntityManager

  beforeEach(() => {
    sessionExpirationMinutes = 10

    sessionIsExpiredStub.reset()
    sessionIsExpiredStub.returns(false)

    sessionExpiredAt.reset()
    sessionExpiredAt.returns(SESSION_EXPIRED_AT)

    emFindOneStub.reset()
    emFindOneStub.throws()
    emFindOneStub
      .withArgs(Session, {
        key: HashUtils.hashSessionId(SESSION_ID),
        user: USER_ID,
      })
      .resolves({ isExpired: sessionIsExpiredStub, expiredAt: sessionExpiredAt })

    emFlushStub.reset()

    nextStub.reset()

    cookieStub.reset()
    cookieStub.throws()
    cookieStub
      .withArgs('_precision-fda_session', REFRESHED_TOKEN, {
        httpOnly: true,
        secure: true,
        path: '/',
      })
      .returns(undefined)
    cookieStub.withArgs('sessionExpiredAt', SESSION_EXPIRED_AT, { secure: true }).returns(undefined)

    userContextStorageRunStub = stub(userContextStorage, 'run')

    encryptorDecryptStub = stub(Encryptor, 'decrypt')
    encryptorDecryptStub.throws()
    encryptorDecryptStub.withArgs(VALID_TOKEN).returns(USER_SESSION)

    encryptorEncryptStub = stub(Encryptor, 'encrypt')
    encryptorEncryptStub.throws()
    encryptorEncryptStub.withArgs(USER_SESSION).returns(REFRESHED_TOKEN)

    cliEncryptorDecryptStub = stub(CliEncryptor, 'decrypt')
    cliEncryptorDecryptStub.throws()
    cliEncryptorDecryptStub.withArgs(VALID_CLI_KEY).returns(USER_SESSION)
  })

  afterEach(() => {
    userContextStorageRunStub.restore()
    encryptorDecryptStub.restore()
    encryptorEncryptStub.restore()
    cliEncryptorDecryptStub.restore()
  })

  it('should run with empty context when no session cookie or authorization key provided', async () => {
    const instance = new UserContextMiddleware(em)

    await instance.use({ headers: {}, url: '/', id: REQUEST_ID } as Request, RESPONSE, nextStub)

    expectRunWithEmptyContext()
  })

  it('should throw unauthorized error in case session cookie decryption fails', async () => {
    encryptorDecryptStub.reset()
    encryptorDecryptStub.throws()

    await expect(callWithSessionToken(VALID_TOKEN)).to.be.rejectedWith(UnauthorizedRequestError)
  })

  it('should run with empty context when session token expired', async () => {
    sessionExpirationMinutes = -10
    await callWithSessionToken(VALID_TOKEN)

    expectRunWithEmptyContext()
  })

  it('should update the session token cookie', async () => {
    await callWithSessionToken(VALID_TOKEN)

    expect(cookieStub.calledTwice).to.be.true()
    expect(cookieStub.firstCall.args[0]).to.eq('_precision-fda_session')
  })

  it('should not update the session token cookie for Ruby user agent', async () => {
    await callWithSessionToken(VALID_TOKEN, 'Ruby')

    expect(cookieStub.calledOnce).to.be.true()
    expect(cookieStub.firstCall.args[0]).not.to.eq('_precision-fda_session')
  })

  it('should update the session expiration cookie value', async () => {
    await callWithSessionToken(VALID_TOKEN)

    expect(cookieStub.calledTwice).to.be.true()
    expect(cookieStub.secondCall.args[0]).to.eq('sessionExpiredAt')
  })

  it('should run with empty user context for session without user id', async () => {
    const NO_USER_ID_USER_SESSION = {
      ...USER_SESSION,
      user_id: undefined,
    }

    encryptorDecryptStub.reset()
    encryptorDecryptStub.throws()
    encryptorDecryptStub.withArgs(VALID_TOKEN).returns(NO_USER_ID_USER_SESSION)

    encryptorEncryptStub.reset()
    encryptorEncryptStub.throws()
    encryptorEncryptStub.withArgs(NO_USER_ID_USER_SESSION).returns(REFRESHED_TOKEN)

    await callWithSessionToken(VALID_TOKEN)

    expectRunWithEmptyContext()
  })

  it('should throw UnauthorizedRequestError if no db session found', async () => {
    emFindOneStub.reset()
    emFindOneStub.throws()
    emFindOneStub
      .withArgs(Session, {
        key: HashUtils.hashSessionId(SESSION_ID),
        user: USER_ID,
      })
      .resolves(null)

    await expect(callWithSessionToken(VALID_TOKEN)).to.be.rejectedWith(UnauthorizedRequestError)
  })

  it('should run with empty context db session expired', async () => {
    sessionIsExpiredStub.reset()
    sessionIsExpiredStub.returns(true)

    await callWithSessionToken(VALID_TOKEN)

    expectRunWithEmptyContext()
  })

  it('should run with user context when valid session cookie provided', async () => {
    await callWithSessionToken(VALID_TOKEN)

    expect(userContextStorageRunStub.calledOnce).to.be.true()
    expect(userContextStorageRunStub.firstCall.args[0]).to.deep.eq({
      id: USER_ID,
      accessToken: PLATFORM_TOKEN,
      dxuser: USER_NAME,
      expiration: USER_SESSION.expiration,
      sessionId: SESSION_ID,
      requestId: REQUEST_ID,
    })
  })

  it('should throw unauthorized error in case cli key decryption fails', async () => {
    cliEncryptorDecryptStub.reset()
    cliEncryptorDecryptStub.throws()

    await expect(callWithAuthHeader(VALID_AUTH_HEADER)).to.be.rejectedWith(UnauthorizedRequestError)
  })

  it('should throw unauthorized error in case cli key decryption fails', async () => {
    cliEncryptorDecryptStub.reset()
    cliEncryptorDecryptStub.throws()

    await expect(callWithAuthHeader(VALID_AUTH_HEADER)).to.be.rejectedWith(UnauthorizedRequestError)
  })

  it('should run with empty context when cli key expired', async () => {
    sessionExpirationMinutes = -10
    await callWithAuthHeader(VALID_AUTH_HEADER)

    expectRunWithEmptyContext()
  })

  it('should run with user context when valid auth header provided', async () => {
    await callWithAuthHeader(VALID_AUTH_HEADER)

    expect(userContextStorageRunStub.calledOnce).to.be.true()
    expect(userContextStorageRunStub.firstCall.args[0]).to.deep.eq({
      id: USER_ID,
      accessToken: PLATFORM_TOKEN,
      dxuser: USER_NAME,
      expiration: USER_SESSION.expiration,
      sessionId: null, // no session id in cli key
      requestId: REQUEST_ID,
    })
  })

  it('should forward next function to run', async () => {
    await callWithSessionToken(VALID_TOKEN)

    expect(userContextStorageRunStub.calledOnce).to.be.true()
    expect(userContextStorageRunStub.firstCall.args[1]).to.eq(nextStub)
  })

  async function callWithSessionToken(token: string, userAgent: string = 'Foo'): Promise<void> {
    const middleware = new UserContextMiddleware(em)
    const req = {
      headers: {
        cookie: `_precision-fda_session=${token}`,
        'user-agent': userAgent,
      },
      url: '/',
      id: REQUEST_ID,
    } as unknown as Request

    const res = {
      cookie: cookieStub,
    } as unknown as Response

    await middleware.use(req, res, nextStub)
  }

  async function callWithAuthHeader(key: string): Promise<void> {
    const middleware = new UserContextMiddleware(em)
    const req = { headers: { authorization: key }, url: '/', id: REQUEST_ID } as unknown as Request

    const res = {} as unknown as Response

    await middleware.use(req, res, nextStub)
  }

  function expectRunWithEmptyContext(): void {
    expect(userContextStorageRunStub.calledOnce).to.be.true()
    const userContext = userContextStorageRunStub.firstCall.args[0]

    expect(userContext.id).to.be.null()
    expect(userContext.accessToken).to.be.null()
    expect(userContext.dxuser).to.be.null()
  }
})
