import crypto from 'node:crypto'
import { expect } from 'chai'
import { CSRFUtils } from '@shared/utils/csrf.utils'

describe('CSRFUtils', () => {
  const csrfToken = crypto.randomBytes(32).toString('base64')

  it('should generate a valid token based on the csrfToken', async () => {
    const token = CSRFUtils.generateToken(csrfToken)
    expect(CSRFUtils.verifyToken(token, csrfToken)).to.be.true()
  })
})
