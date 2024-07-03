import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AdminPlatformClientService } from '../../src/service/admin-platform-client.service'

describe('AdminPlatformClientService', () => {
  const ALLOWED_METHOD = 'createOrg'
  const NOT_ALLOWED_METHOD = 'NOT_ALLOWED_METHOD'
  const NON_METHOD_KEY = 'NON_METHOD_KEY'
  const allowedMethodStub = stub()
  const notAllowedMethodStub = stub()

  beforeEach(() => {
    allowedMethodStub.reset()
    allowedMethodStub.throws()

    notAllowedMethodStub.reset()
    notAllowedMethodStub.throws()
  })

  it('should throw error for non function key', async () => {
    await expect(getInstance().execute(NON_METHOD_KEY, [])).to.be.rejectedWith(
      BadRequestException,
      'Invalid method',
    )
  })

  it('should throw error for non existing key', async () => {
    await expect(getInstance().execute('foo', [])).to.be.rejectedWith(
      BadRequestException,
      'Invalid method',
    )
  })

  it('should throw error for non allowed method', async () => {
    await expect(getInstance().execute(NOT_ALLOWED_METHOD, [])).to.be.rejectedWith(
      ForbiddenException,
      `Method "${NOT_ALLOWED_METHOD}" is not allowed to be called on the admin platform client`,
    )
  })

  it('should not catch error from the client', async () => {
    const error = new Error('my error')
    allowedMethodStub.reset()
    allowedMethodStub.throws(error)

    await expect(getInstance().execute(ALLOWED_METHOD, [])).to.be.rejectedWith(error)
  })

  it('should return the result from platform client with correct args', async () => {
    const ARGS = [true, 'foo', { bar: 'baz' }, [6, 7]]
    const RESULT = 'result'
    allowedMethodStub.withArgs(...ARGS).resolves(RESULT)

    const res = await getInstance().execute(ALLOWED_METHOD, ARGS)

    expect(res).to.eq(RESULT)
    expect(allowedMethodStub.calledOnce).to.be.true()
  })

  it('should return the result from platform client with no args', async () => {
    const RESULT = 'result'
    allowedMethodStub.withArgs().resolves(RESULT)

    const res = await getInstance().execute(ALLOWED_METHOD, [])

    expect(res).to.eq(RESULT)
    expect(allowedMethodStub.calledOnce).to.be.true()
  })

  function getInstance() {
    const platformClient = {
      [NON_METHOD_KEY]: true,
      [ALLOWED_METHOD]: allowedMethodStub,
      [NOT_ALLOWED_METHOD]: notAllowedMethodStub,
    } as unknown as PlatformClient

    return new AdminPlatformClientService(platformClient)
  }
})
