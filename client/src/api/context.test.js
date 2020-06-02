import * as API from './context'
import * as Utils from '../utils/api'


describe('fetchContext()', () => {
  it('sends correct request', () => {
    Utils.backendCall = jest.fn(() => Promise.resolve())

    return API.fetchContext().then(() => {
      expect(Utils.backendCall.mock.calls.length).toEqual(1)
      expect(Utils.backendCall.mock.calls[0][0]).toEqual('/api/user')
      expect(Utils.backendCall.mock.calls[0][1]).toEqual('GET')
    })
  })
})
