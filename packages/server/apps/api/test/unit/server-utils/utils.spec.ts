import { expect } from 'chai'
import { log } from '../../../src/logger'
import { isRequestFromFdaSubnet } from '../../../src/server/utils'

describe('Server.utils ', () => {
  context('isRequestFromFdaSubnet', () => {
    it('should return true - valid IP', async () => {
      const result = isRequestFromFdaSubnet(log, '127.0.0.1')
      expect(result).to.be.true()
    })

    it('should return false - invalid IP', async () => {
      const result = isRequestFromFdaSubnet(log, '203.0.113.42')
      expect(result).to.be.false()
    })
  })
})
