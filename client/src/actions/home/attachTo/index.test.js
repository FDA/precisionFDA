import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import attachTo from '.'
import reducer from '../../../reducers'
import {
  HOME_APPS_ATTACH_TO_START,
  HOME_APPS_ATTACH_TO_SUCCESS,
  HOME_APPS_ATTACH_TO_FAILURE,
  HOME_FILES_ATTACH_TO_START,
  HOME_FILES_ATTACH_TO_SUCCESS,
  HOME_FILES_ATTACH_TO_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('attachTo()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const noteUids = [1, 2, 3]
    const items = [1, 2]
    const objectType = OBJECT_TYPES.APP
    const copyLink = '/api/attach_to_notes'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(copyLink, { meta: { messages }})

      return store.dispatch(attachTo(objectType, items, noteUids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_ATTACH_TO_START, payload: {}},
          { type: HOME_APPS_ATTACH_TO_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 1',
              style: 'warning',
              type: ALERT_ABOVE_ALL,
            },
          },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 2',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(copyLink, { status: 500, body: {}})

      return store.dispatch(attachTo(objectType, items, noteUids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_ATTACH_TO_START, payload: {}},
          { type: HOME_APPS_ATTACH_TO_FAILURE, payload: {}},
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


describe('attachTo()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const noteUids = [1, 2, 3]
    const items = [1, 2]
    const objectType = OBJECT_TYPES.FILE
    const copyLink = '/api/attach_to_notes'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(copyLink, { meta: { messages }})

      return store.dispatch(attachTo(objectType, items, noteUids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_ATTACH_TO_START, payload: {}},
          { type: HOME_FILES_ATTACH_TO_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 1',
              style: 'warning',
              type: ALERT_ABOVE_ALL,
            },
          },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 2',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(copyLink, { status: 500, body: {}})

      return store.dispatch(attachTo(objectType, items, noteUids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_ATTACH_TO_START, payload: {}},
          { type: HOME_FILES_ATTACH_TO_FAILURE, payload: {}},
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