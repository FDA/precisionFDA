import fetchMock from 'fetch-mock'

import { mockStore } from '../../../test/helper'
import fetchContext from './index'
import * as API from '../../api/context'
import reducer from '../../reducers'
import {
  CONTEXT_FETCH_START,
  CONTEXT_FETCH_SUCCESS,
} from './types'
import { HOME_SET_INITIAL_PAGE_COUNTERS, HOME_SET_INITIAL_PAGE_ADMIN_STATUS } from '../home/types' 


describe('createSpace()', () => {
  const store = mockStore(reducer({}, { type: undefined }))

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  it('dispatches correct actions on success', () => {
    const response = {
      meta: {
        counters: {},
        admin: false,
      },
      user: 'some user',
    }

    fetchMock.get('/api/user', response)

    return store.dispatch(fetchContext()).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: CONTEXT_FETCH_START, payload: {}},
        { type: CONTEXT_FETCH_SUCCESS, payload: response },
        { type: HOME_SET_INITIAL_PAGE_COUNTERS, payload: response.meta.counters },
        { type: HOME_SET_INITIAL_PAGE_ADMIN_STATUS, payload: response.meta.admin },
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
