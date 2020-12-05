import * as BE from './home'
import * as API from '../utils/api'


describe('Backend calls', () => {
  beforeEach(() => {
    API.backendCall = jest.fn(() => Promise.resolve())
  })

  describe('getApps()', () => {
    it('sends correct request', async () => {
      const data = 'some data'

      await BE.getApps(data)
      expect(API.backendCall.mock.calls.length).toEqual(1)
      expect(API.backendCall.mock.calls[0][0]).toEqual('/api/apps')
      expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
      expect(API.backendCall.mock.calls[0][2]).toEqual(data)
    })
  })

  describe('getAppsFeatured()', () => {
    it('sends correct request', async () => {
      const data = 'some data'

      await BE.getAppsFeatured(data)
      expect(API.backendCall.mock.calls.length).toEqual(1)
      expect(API.backendCall.mock.calls[0][0]).toEqual('/api/apps/featured')
      expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
      expect(API.backendCall.mock.calls[0][2]).toEqual(data)
    })
  })
})