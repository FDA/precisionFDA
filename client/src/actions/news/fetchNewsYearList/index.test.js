import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchNewsYearList } from '..'
import reducer from '../../../reducers'
import {
  NEWS_YEAR_LIST_FETCH_START,
  NEWS_YEAR_LIST_FETCH_SUCCESS,
} from '../types'


describe('fetchNewsYearList()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const yearList = [2015, 2014, 2013]
      fetchMock.get('/api/news/years', yearList)

      store.dispatch(fetchNewsYearList()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: NEWS_YEAR_LIST_FETCH_START, payload: {}},
          { type: NEWS_YEAR_LIST_FETCH_SUCCESS, payload: { yearList: yearList }},
        ])
      })
    })
  })
})
