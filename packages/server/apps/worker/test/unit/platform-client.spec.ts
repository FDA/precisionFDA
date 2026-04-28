import { expect } from 'chai'
import { ClientRequestError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { createETIMEOUTError, createGatewayError, createPermissionsDeniedError } from '../utils/platform-client.mock'

type PlatformClientPrivate = {
  handleFailed: (err: unknown) => never
}

describe('platform-client', () => {
  it('handles normal platform errors', () => {
    const platformClient = new PlatformClient({ accessToken: 'token-123' })
    const error = getClientRequestError(() => callHandleFailed(platformClient, createPermissionsDeniedError()))

    const expectedMessage =
      "PermissionDenied (401): BillTo for this job's project must have " +
      'the "httpsApp" feature enabled to run this executable'

    expect(error.message).to.equal(expectedMessage)
    expect(error.props.clientStatusCode).to.equal(401)
  })

  it('handles 504 errors', () => {
    const platformClient = new PlatformClient({ accessToken: 'token-123' })
    const gatewayError = createGatewayError()
    const error = getClientRequestError(() => callHandleFailed(platformClient, gatewayError))

    const expectedMessage = `Server Error (504): ${gatewayError.response.data}`

    expect(error.message).to.equal(expectedMessage)
    expect(error.props.clientStatusCode).to.equal(504)
  })

  it('handles HTML errors', () => {
    const platformClient = new PlatformClient({ accessToken: 'token-123' })
    const error = getClientRequestError(() => callHandleFailed(platformClient, createETIMEOUTError()))

    const expectedMessage =
      'Error: connect ETIMEDOUT 192.168.119.135:443\n    at ' +
      'TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16)'

    expect(error.message).to.equal(expectedMessage)
  })

  function callHandleFailed(platformClient: PlatformClient, err: unknown): never {
    const privateApi = platformClient as unknown as PlatformClientPrivate
    return privateApi.handleFailed(err)
  }

  function getClientRequestError(run: () => never): ClientRequestError {
    let caught: unknown

    try {
      run()
    } catch (error: unknown) {
      caught = error
    }

    if (caught instanceof ClientRequestError) {
      return caught
    }

    throw new Error('Expected ClientRequestError from handleFailed')
  }
})
