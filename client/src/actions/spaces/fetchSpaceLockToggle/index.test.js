import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchSpaceLockToggle } from '.'
import reducer from '../../../reducers'
import {
  SPACE_LOCK_TOGGLE_START,
  SPACE_LOCK_TOGGLE_SUCCESS,
  SPACE_LOCK_TOGGLE_FAILURE,
} from '../types'
import * as MAP from '../../../views/shapes/SpaceShape'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'


describe('fetchSpaceLockToggle()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const spaces = [{ id: 1, shared: { isLocked: true }}, { id: 2, shared: { isLocked: false }}]
    const newSpaces = [{ id: 1, shared: { isLocked: false }}, { id: 2, shared: { isLocked: false }}]
    const url = '/spaces/spaceId/lock'
    const store = mockStore(reducer({ spaces: { list: { entries: spaces }}}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('fetchSpaceLockToggle dispatches correct actions on success response', () => {
      fetchMock.post(url, {})
      MAP.mapToSpace = jest.fn(() => ({ isLocked: false }))

      return store.dispatch(fetchSpaceLockToggle(1, url)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_LOCK_TOGGLE_START, payload: newSpaces },
          { type: SPACE_LOCK_TOGGLE_SUCCESS, payload: newSpaces },
          showAlertAboveAllSuccess({ message: 'Space state changed successfully.' }),
        ])
      })
    })

    it('fetchSpaceLockToggle dispatches correct actions on failure response', () => {
      fetchMock.post(url, { status: 500, body: {}})

      return store.dispatch(fetchSpaceLockToggle(1, url)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_LOCK_TOGGLE_START, payload: newSpaces },
          { type: SPACE_LOCK_TOGGLE_FAILURE, payload: { spaces }},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
