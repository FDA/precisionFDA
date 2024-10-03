import { CookieUtils } from '@shared/utils/cookie.utils'
import { expect } from 'chai'

describe('CookieUtils', () => {
  it('parseCookies', async () => {
    const cookies = 'key1=value1; key2=value2; key3=value'
    const result = CookieUtils.parseCookies(cookies)
    expect(result).to.deep.equal({ key1: 'value1', key2: 'value2', key3: 'value' })
  })

  it('getCookie', async () => {
    const cookies = 'key1=value1; key2=value2; key3=value'
    const result = CookieUtils.getCookie('key2', cookies)
    expect(result).to.equal('value2')
  })

  it('testCookieByKey', async () => {
    const cookies = 'key1=value1; key2=value2; key3=value'
    expect(CookieUtils.testCookieByKey('key2', cookies)).to.be.true()
    expect(CookieUtils.testCookieByKey('key', cookies)).to.be.false()
  })
})
