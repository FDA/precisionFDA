import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import publishFiles from '.'
import reducer from '../../../../reducers'
import {
  SPACE_PUBLISH_FILES_START,
  SPACE_PUBLISH_FILES_SUCCESS,
  SPACE_PUBLISH_FILES_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('publishFiles()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const files = [{ id: 1 }, { id: 2 }]
    const publishLink = '/api/files/publish'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(publishLink, {})

      return store.dispatch(publishFiles(publishLink, files)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_PUBLISH_FILES_START, payload: {}},
          { type: SPACE_PUBLISH_FILES_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: '2 file(s) successfully published.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(publishLink, { status: 500, body: {}})

      return store.dispatch(publishFiles(publishLink, files)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_PUBLISH_FILES_START, payload: {}},
          { type: SPACE_PUBLISH_FILES_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
