import { PlatformClient } from '@shared/platform-client'
import {
  createPermissionsDeniedError,
  createGatewayError,
  createETIMEOUTError,
} from '../utils/platform-client.mock'
import { expect } from 'chai'


describe('platform-client', () => {
  it('handles normal platform errors', async () => {
    const platformClient = new PlatformClient()
    try {
      platformClient.handleFailed(createPermissionsDeniedError())
    } catch (error) {
      const expectedMessage = 'PermissionDenied (401): BillTo for this job\'s project must have ' +
                              'the "httpsApp" feature enabled to run this executable'
      expect(error.message).to.equal(expectedMessage)
      expect(error.props.clientStatusCode).to.equal(401)
    }
  })

  it('handles 504 errors', async () => {
    const platformClient = new PlatformClient()
    try {
      platformClient.handleFailed(createGatewayError())
    } catch (error) {
      const expectedMessage = 'Server Error (504): <html>\r\n<head><title>504 Gateway Time-out' +
                              '</title></head></html>\r\n'
      expect(error.message).to.equal(expectedMessage)
      expect(error.props.clientStatusCode).to.equal(504)
    }
  })

  it('handles HTML errors', async () => {
    try {
      const platformClient = new PlatformClient()
      platformClient.handleFailed(createETIMEOUTError())
    } catch (error) {
      const expectedMessage = 'Error: connect ETIMEDOUT 192.168.119.135:443\n    at ' +
                              'TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16)'
      expect(error.message).to.equal(expectedMessage)
    }
  })
})
