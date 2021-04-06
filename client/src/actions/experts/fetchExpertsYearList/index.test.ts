import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchExpertsYearList } from '.'
import {
  EXPERTS_YEAR_LIST_FETCH_START,
  EXPERTS_YEAR_LIST_FETCH_SUCCESS,
} from '../types'
import { combineReducers } from 'redux'
import expertsReducer from '../../../reducers/experts'


describe('fetchExpertsYearList()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(combineReducers({expertsReducer}))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const yearList = [2015, 2014, 2013]
      fetchMock.get('/api/experts/years', yearList)

      return store.dispatch(fetchExpertsYearList()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: EXPERTS_YEAR_LIST_FETCH_START, payload: {} },
          { type: EXPERTS_YEAR_LIST_FETCH_SUCCESS, payload: { yearList: yearList }},
        ])
      })
    })
  })
})
