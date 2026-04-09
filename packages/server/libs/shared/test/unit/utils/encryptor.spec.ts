import { expect } from 'chai'
import { Encryptor } from '@shared/utils/encryptors/encryptor'

describe('Encryptor', () => {
  it('should generate different token for the same session', () => {
    const session = {
      session_id: '123',
      _csrf_token: 'csrf_token',
      user_id: 1,
      username: 'test',
      token: 'token',
      expiration: 123456,
      org_id: 1,
    }

    const encrypted1 = Encryptor.encrypt(session)
    const encrypted2 = Encryptor.encrypt(session)
    expect(encrypted1).to.not.equal(encrypted2)
  })

  it('should generate new token correctly', () => {
    const session = {
      session_id: '123',
      _csrf_token: 'csrf_token',
      user_id: 1,
      username: 'test',
      token: 'token',
      expiration: 123456,
      org_id: 1,
    }

    const encrypted = Encryptor.encrypt(session)
    const decrypted = Encryptor.decrypt(encrypted)
    expect(decrypted).to.deep.equal(session)
  })
})
