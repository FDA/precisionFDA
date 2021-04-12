import * as BE from './experts'
import * as API from '../utils/api'


describe('Backend calls', () => {
  beforeEach(() => {
    API.backendCall = jest.fn(() => Promise.resolve())
  })

  describe('getExperts()', () => {
    it('sends correct request', () => {
      const data = 'some data'

      return BE.getExperts(data).then(() => {
        expect(API.backendCall.mock.calls.length).toEqual(1)
        expect(API.backendCall.mock.calls[0][0]).toEqual('/api/experts')
        expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
      })
    })
  })
})
