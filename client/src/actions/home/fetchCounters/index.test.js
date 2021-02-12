import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import fetchCounters from './index'
import reducer from '../../../reducers'
import {
  HOME_FETCH_COUNTERS_SUCCESS,
} from '../types'
import { HOME_TABS } from '../../../constants'


describe('fetchCounters()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const counters = {}
    const tab = HOME_TABS.PRIVATE

    const store = mockStore(reducer({
      home: {
        page: {
          counters: {},
        },
      },
    }, { type: undefined }))
    const url = '/api/counters'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, counters)

      return store.dispatch(fetchCounters(tab)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FETCH_COUNTERS_SUCCESS, payload: { counters, tab }},
        ])
      })
    })
  })
})
