import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchApps from '.'
import reducer from '../../../../reducers'
import * as API from '../../../../api/spaces'
import {
  SPACE_APPS_FETCH_START,
  SPACE_APPS_FETCH_SUCCESS,
  SPACE_APPS_FETCH_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/AppShape'


describe('fetchApps()', () => {
  const spaceId = 1

  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const apps = ['app1', 'app2']
    const links = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = `/api/spaces/${spaceId}/apps`
    MAP.mapToApp = jest.fn((app) => (app))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { apps, meta: { links }})

      return store.dispatch(fetchApps(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_APPS_FETCH_START, payload: {}},
          { type: SPACE_APPS_FETCH_SUCCESS, payload: { apps, links }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchApps(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_APPS_FETCH_START, payload: {}},
          { type: SPACE_APPS_FETCH_FAILURE, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
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
      API.getApps = jest.fn(() => Promise.resolve({ payload: { apps: []}}))
    })

    describe('when sort type is given', () => {
      const sortType = 'some order'
      const sortDirection = 'some direction'
      const store = mockStore(reducer({
        spaces: {
          apps: {
            sortType,
            sortDirection,
          },
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        const expectedQuery = { order_by: sortType, order_dir: sortDirection }

        return store.dispatch(fetchApps(spaceId)).then(() => {
          expect(API.getApps.mock.calls.length).toEqual(1)
          expect(API.getApps.mock.calls[0][1]).toEqual(expectedQuery)
        })
      })
    })

    describe('when sort type is not given', () => {
      const store = mockStore(reducer({
        spaces: {
          apps: {},
        },
      }, { type: undefined }))

      it("doesn't pass it to API call", () => {
        return store.dispatch(fetchApps(spaceId)).then(() => {
          expect(API.getApps.mock.calls.length).toEqual(1)
          expect(API.getApps.mock.calls[0][1]).toEqual({})
        })
      })
    })
  })
})
