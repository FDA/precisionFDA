import * as BE from './participants'
import * as API from '../utils/api'


// TODO: Redo using ddcsch's example
describe('Backend calls', () => {
  beforeEach(() => {
    API.backendCall = jest.fn(() => Promise.resolve())
  })

  describe('getParticipantsQuery()', () => {
    it.skip('sends correct request', () => { // Skipping until https://github.com/dnanexus/precision-fda/pull/1354 is merged
      const data = 'some data'

      return BE.getParticipants(data).then(() => {
        expect(API.backendCall.mock.calls.length).toEqual(1)
        expect(API.backendCall.mock.calls[0][0]).toEqual('/api/participants')
        expect(API.backendCall.mock.calls[0][1]).toEqual('GET')
      })
    })
  })
})
