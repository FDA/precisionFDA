import * as BE from './spaces'
import * as API from '../utils/api'


describe('Backend calls', () => {
  beforeEach(() => {
    API.backendCall = jest.fn(() => Promise.resolve())
  })

  describe('getSpaces()', () => {
    it('sends correct request', () => {
      const data = 'some data'

      return BE.getSpaces(data).then(() => {
        expect(API.backendCall.mock.calls.length).toEqual(1)
        expect(API.backendCall.mock.calls[0][0]).toEqual('/api/spaces')
        expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
        expect(API.backendCall.mock.calls[0][2]).toEqual(data)
      })
    })
  })

  describe('acceptSpace()', () => {
    it('sends correct request', () => {
      const route = 'someRoute'

      return BE.acceptSpace(route).then(() => {
        expect(API.backendCall.mock.calls.length).toEqual(1)
        expect(API.backendCall.mock.calls[0][0]).toEqual(route)
        expect(API.backendCall.mock.calls[0][1]).toEqual('POST')
        expect(API.backendCall.mock.calls[0][2]).toEqual(undefined)
      })
    })
  })
})
