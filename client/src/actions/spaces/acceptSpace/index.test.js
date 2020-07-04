import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import acceptSpace from './index'
import {
  SPACE_ACCEPT_START,
  SPACE_ACCEPT_SUCCESS,
  SPACE_ACCEPT_FAILURE,
  SPACE_FETCH_SUCCESS,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'
import * as mappers from '../../../views/shapes/SpaceShape'


describe('acceptSpace()', () => {
  const store = mockStore({
    context: {
      user: {
        id: 1,
      },
    },
  })

  const space = {
    id: 'someId',
    links: {
      accept: 'spaces/someId/accept',
    },
  }

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  it('dispatches correct actions on success', () => {
    const response = { space }

    fetchMock.post('/spaces/someId/accept', { body: response, status: 200 })

    mappers.mapToSpace = jest.fn(() => space)

    return store.dispatch(acceptSpace(space)).then(() => {
      expect(store.getActions()).toEqual([
        { type: SPACE_ACCEPT_START, payload: {}},
        { type: SPACE_ACCEPT_SUCCESS, payload: {}},
        { type: SPACE_FETCH_SUCCESS, payload: space },
        {
          type: ALERT_SHOW_ABOVE_ALL,
          payload: {
            style: 'success',
            message: 'Space successfully accepted',
            type: ALERT_ABOVE_ALL,
          },
        },
      ])
    })
  })

  it('dispatches correct actions on forbidden', () => {
    const response = { space }

    fetchMock.post('/spaces/someId/accept', { body: response, status: 403 })

    return store.dispatch(acceptSpace(space)).then(() => {
      expect(store.getActions()).toEqual([
        { type: SPACE_ACCEPT_START, payload: {}},
        { type: SPACE_ACCEPT_FAILURE, payload: {}},
        {
          type: ALERT_SHOW_ABOVE_ALL,
          payload: {
            style: 'warning',
            message: "You're not allowed to accept this space",
            type: ALERT_ABOVE_ALL,
          },
        },
      ])
    })
  })

  it('dispatches correct actions on failure', () => {
    const response = { space }

    fetchMock.post('/spaces/someId/accept', { body: response, status: 500 })

    return store.dispatch(acceptSpace(space)).then(() => {
      expect(store.getActions()).toEqual([
        { type: SPACE_ACCEPT_START, payload: {}},
        { type: SPACE_ACCEPT_FAILURE, payload: {}},
        {
          type: ALERT_SHOW_ABOVE_ALL,
          payload: {
            style: 'warning',
            message: 'Something went wrong',
            type: ALERT_ABOVE_ALL,
          },
        },
      ])
    })
  })
})
