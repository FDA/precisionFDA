import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import fetchAccessibleSpaces from '.'
import reducer from '../../../reducers'
import {
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import * as MAP from '../../../views/shapes/AccessibleObjectsShape'


describe('fetchAccessibleSpaces()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const url = '/api/spaces/editable_spaces'
    const spaces = ['space1', 'space2']
    const store = mockStore(reducer({
      context: {
        links: {
          accessible_spaces: url,
        },
      },
      spaces: {
        files: {
          copyModal: { spaces: []},
        },
      },
    }, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('fetchAccessibleSpaces dispatches correct actions on success response', () => {
      fetchMock.get(url, spaces)
      MAP.mapToAccessibleSpace = jest.fn((space) => space)

      return store.dispatch(fetchAccessibleSpaces()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_SPACES_START, payload: {}},
          { type: FETCH_ACCESSIBLE_SPACES_SUCCESS, payload: spaces },
        ])
      })
    })

    it('fetchAccessibleSpaces dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchAccessibleSpaces()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_SPACES_START, payload: {}},
          { type: FETCH_ACCESSIBLE_SPACES_FAILURE, payload: {}},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
