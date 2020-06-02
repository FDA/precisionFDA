import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchSpaces } from '.'
import * as API from '../../../api/spaces'
import reducer from '../../../reducers'
import {
  SPACES_FETCH_START,
  SPACES_FETCH_SUCCESS,
  SPACES_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { SPACE_TYPE_CARD, SPACE_TYPE_TABLE, ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchSpaces()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get('/api/spaces', { spaces: [], meta: {}})

      return store.dispatch(fetchSpaces()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACES_FETCH_START, payload: {}},
          { type: SPACES_FETCH_SUCCESS, payload: { spaces: [], pagination: {}}},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/spaces', { status: 500, body: {}})

      return store.dispatch(fetchSpaces()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACES_FETCH_START, payload: {}},
          { type: SPACES_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })

  describe('params building', () => {
    beforeEach(() => {
      API.getSpaces = jest.fn(() => Promise.resolve({ payload: { spaces: [], meta: { links: {}}}}))
    })

    describe('when search string given', () => {
      const searchString = 'some string'
      const store = mockStore(reducer({
        spaces: {
          list: {
            searchString,
          },
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        return store.dispatch(fetchSpaces()).then(() => {
          expect(API.getSpaces.mock.calls.length).toEqual(1)
          expect(API.getSpaces.mock.calls[0][0]).toEqual({ query: searchString })
        })
      })
    })

    describe('when search string given', () => {
      const store = mockStore(reducer({}, { type: undefined }))

      it('doesn\'t pass it to API call', () => {
        return store.dispatch(fetchSpaces()).then(() => {
          expect(API.getSpaces.mock.calls.length).toEqual(1)
          expect(API.getSpaces.mock.calls[0][0]).toEqual({})
        })
      })
    })

    describe('when viewType is list', () => {
      describe('when sort type given', () => {
        const sortType = 'some order'
        const sortDirection = 'some direction'
        const store = mockStore(reducer({
          spaces: {
            list: {
              sortType,
              sortDirection,
              viewType: SPACE_TYPE_TABLE,
            },
          },
        }, { type: undefined }))

        it('passes it to API call', () => {
          const expectedQuery = { order_by: sortType, order_dir: sortDirection }

          return store.dispatch(fetchSpaces()).then(() => {
            expect(API.getSpaces.mock.calls.length).toEqual(1)
            expect(API.getSpaces.mock.calls[0][0]).toEqual(expectedQuery)
          })
        })
      })

      describe('when sort type not given', () => {
        const store = mockStore(reducer({
          spaces: {
            list: {
              viewType: SPACE_TYPE_TABLE,
            },
          },
        }, { type: undefined }))

        it('doesn\'t pass it to API call', () => {
          return store.dispatch(fetchSpaces()).then(() => {
            expect(API.getSpaces.mock.calls.length).toEqual(1)
            expect(API.getSpaces.mock.calls[0][0]).toEqual({})
          })
        })
      })
    })

    describe('when view type is not list', () => {
      describe('when sort type given', () => {
        const sortType = 'some order'
        const sortDirection = 'some direction'
        const store = mockStore(reducer({
          spaces: {
            list: {
              sortType,
              sortDirection,
              viewType: SPACE_TYPE_CARD,
            },
          },
        }, { type: undefined }))

        it('doesn\'t pass it to API call', () => {
          return store.dispatch(fetchSpaces()).then(() => {
            expect(API.getSpaces.mock.calls.length).toEqual(1)
            expect(API.getSpaces.mock.calls[0][0]).toEqual({})
          })
        })
      })
    })
  })
})
