import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import fetchNewSpaceInfo from './index'
import reducer from '../../../reducers'
import {
  SPACE_CREATION_FETCH_INFO_FAILURE,
  SPACE_CREATION_FETCH_INFO_START,
  SPACE_CREATION_FETCH_INFO_SUCCESS,
} from '../types'


describe('fetchNewSpaceInfo()', () => {
  const store = mockStore(reducer({
    context: {
      links: {
        space_info: '/api/spaces/info',
      },
    },
  }, { type: undefined }))

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  it('dispatches correct actions on success', () => {
    const response = { someKey: 'someValue' }

    fetchMock.get('/api/spaces/info', response)

    return store.dispatch(fetchNewSpaceInfo()).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: SPACE_CREATION_FETCH_INFO_START, payload: {}},
        { type: SPACE_CREATION_FETCH_INFO_SUCCESS, payload: response },
      ])
    })
  })

  it('dispatches correct actions on failure', () => {
    const params = {}

    fetchMock.get('/api/spaces/info', { body: {}, status: 400 })

    return store.dispatch(fetchNewSpaceInfo(params)).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: SPACE_CREATION_FETCH_INFO_START, payload: {}},
        { type: SPACE_CREATION_FETCH_INFO_FAILURE, payload: {}},
      ])
    })
  })
})
