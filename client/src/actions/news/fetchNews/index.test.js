import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchNews } from '.'
import reducer from '../../../reducers'
import {
  NEWS_LIST_FETCH_START,
  NEWS_LIST_FETCH_SUCCESS,
  NEWS_LIST_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchNews()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const news = []
      fetchMock.get('/api/news', { news_items: news, meta: {}})

      store.dispatch(fetchNews()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: NEWS_LIST_FETCH_START, payload: {}},
          { type: NEWS_LIST_FETCH_SUCCESS, payload: { news: news, pagination: {}, year: undefined }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/news', { status: 500, body: {}})

      store.dispatch(fetchNews()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          // { type: NEWS_LIST_FETCH_START, payload: {}},
          { type: NEWS_LIST_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong loading News!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
