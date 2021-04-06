import * as BE from './challenges'
import * as API from '../utils/api'


describe('Backend calls', () => {
  beforeEach(() => {
    API.backendCall = jest.fn(() => Promise.resolve())
  })

  describe('getChallenges()', () => {
    it('sends correct request', () => {
      const data = 'some data'

      return BE.getChallenges(data).then(() => {
        expect(API.backendCall.mock.calls.length).toEqual(1)
        expect(API.backendCall.mock.calls[0][0]).toEqual('/api/challenges')
        expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
        expect(API.backendCall.mock.calls[0][2]).toEqual(data)
      })
    })
  })
})
