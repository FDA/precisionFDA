import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import createSpace from './index'
import * as API from '../../../api/spaces'
import history from '../../../utils/history'
import reducer from '../../../reducers'
import {
  SPACE_CREATION_START,
  SPACE_CREATION_SUCCESS,
  SPACE_CREATION_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'
import * as MAP from '../../../views/shapes/SpaceShape'


describe('createSpace()', () => {
  const store = mockStore(reducer({
    context: {
      links: {
        space_create: '/spaces',
      },
    },
  }, { type: undefined }))

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  describe('successful response', () => {
    it('dispatches correct actions', () => {
      const response = { space: { id: 'spaceId' }}
      const params = {}

      fetchMock.post('/spaces', response)
      MAP.mapToSpace = jest.fn(() => ({ space: {}}))

      return store.dispatch(createSpace(params)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_CREATION_START, payload: {}},
          { type: SPACE_CREATION_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              style: 'success',
              message: 'Space has been successfully created.',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('redirects to spaces if space show link is not returned', () => {
      const space = { id: 'someId', links: {}}
      const params = {}

      fetchMock.post('/spaces', { space })
      MAP.mapToSpace = jest.fn(() => space)

      history.push = jest.fn(() => {})

      return store.dispatch(createSpace(params)).then(() => {
        expect(history.push.mock.calls.length).toEqual(1)
        expect(history.push.mock.calls[0][0]).toEqual('/spaces')
      })
    })

    it('redirects to space if space show link is returned', () => {
      const showLink = '/spaces/someId'
      const space = { id: 'someId', links: { show: 'some-link' }}
      const params = {}

      MAP.mapToSpace = jest.fn(() => space)
      fetchMock.post('/spaces', { space })

      history.push = jest.fn(() => {})

      return store.dispatch(createSpace(params)).then(() => {
        expect(history.push.mock.calls.length).toEqual(1)
        expect(history.push.mock.calls[0][0]).toEqual(showLink)
      })
    })
  })

  it('dispatches correct actions on failure', () => {
    const response = { errors: ['some errors']}
    const params = {}

    fetchMock.post('/spaces', { body: response, status: 400 })

    return store.dispatch(createSpace(params)).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: SPACE_CREATION_START, payload: {}},
        { type: SPACE_CREATION_FAILURE, payload: response },
        {
          type: ALERT_SHOW_ABOVE_ALL,
          payload: {
            message: 'some errors',
            type: ALERT_ABOVE_ALL,
          },
        },
      ])
    })
  })

  it('calls API', () => {
    API.createSpace = jest.fn(() => Promise.resolve({}))

    return store.dispatch(createSpace()).then(() => {
      expect(API.createSpace.mock.calls.length).toEqual(1)
    })
  })
})
