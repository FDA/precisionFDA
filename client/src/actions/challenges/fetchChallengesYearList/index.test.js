import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchChallengesYearList } from '.'
import reducer from '../../../reducers'
import {
  CHALLENGES_YEAR_LIST_FETCH_START,
  CHALLENGES_YEAR_LIST_FETCH_SUCCESS,
} from '../types'


describe('fetchChallengesYearList()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get('/api/challenges/years', [2015, 2014, 2013])

      return store.dispatch(fetchChallengesYearList()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: CHALLENGES_YEAR_LIST_FETCH_START, payload: {}},
          { type: CHALLENGES_YEAR_LIST_FETCH_SUCCESS, payload: [2015, 2014, 2013]},
        ])
      })
    })
  })
})
