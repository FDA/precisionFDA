import fetchMock from 'fetch-mock'

import { mockStore } from '../../../test/helper'
import fetchContext from './index'
import * as API from '../../api/context'
import reducer from '../../reducers'
import {
  CONTEXT_FETCH_FAILURE,
  CONTEXT_FETCH_START,
  CONTEXT_FETCH_SUCCESS,
} from './types'


describe('createSpace()', () => {
  const store = mockStore(reducer({}, { type: undefined }))

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  it('dispatches correct actions on success', () => {
    const response = { meta: 'some meta', user: 'some user' }

    fetchMock.get('/api/user', response)

    return store.dispatch(fetchContext()).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: CONTEXT_FETCH_START, payload: {}},
        { type: CONTEXT_FETCH_SUCCESS, payload: response },
      ])
    })
  })

  it('dispatches correct actions on failure', () => {
    fetchMock.get('/api/user', { body: null, status: 500 })

    return store.dispatch(fetchContext()).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: CONTEXT_FETCH_START, payload: {}},
        { type: CONTEXT_FETCH_FAILURE, payload: {}},
      ])
    })
  })

  it('calls API', () => {
    API.fetchContext = jest.fn(() => Promise.resolve({}))

    return store.dispatch(fetchContext()).then(() => {
      expect(API.fetchContext.mock.calls.length).toEqual(1)
    })
  })
})
