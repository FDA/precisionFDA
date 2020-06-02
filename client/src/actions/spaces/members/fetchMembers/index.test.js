import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchMembers from '.'
import reducer from '../../../../reducers'
import * as API from '../../../../api/spaces'
import {
  SPACE_MEMBERS_FETCH_START,
  SPACE_MEMBERS_FETCH_SUCCESS,
  SPACE_MEMBERS_FETCH_FAILURE,
} from '../../types'
import * as MAP from '../../../../views/shapes/MemberShape'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('fetchMembers()', () => {
  const spaceId = 1
  const side = null

  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const members = [
      { id: 1, user_name: 'user member one', title: 'admin', created_at: '2020-03-01',
        role: 'lead', side: 'host' },
      { id: 2, user_name: 'user member two', title: 'user', created_at: '2020-03-24',
        role: 'lead', side: 'guest' },
    ]
    const store = mockStore(reducer({}, { type: undefined }))
    const url = `/api/spaces/${spaceId}/members?side`

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { space_memberships: members })

      return store.dispatch(fetchMembers(spaceId, side)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_MEMBERS_FETCH_START, payload: {}},
          { type: SPACE_MEMBERS_FETCH_SUCCESS, payload: { members: members.map(MAP.mapToMember) }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchMembers(spaceId, side)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_MEMBERS_FETCH_START, payload: {}},
          { type: SPACE_MEMBERS_FETCH_FAILURE, payload: {}},
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
      API.getMembers = jest.fn(() => Promise.resolve({ payload: { members: []}}))
    })

    describe('when members Side is given', () => {
      const side = 'all'

      const store = mockStore(reducer({
        spaces: {
          members: {},
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        const expectedQuery = { side: 'all' }

        return store.dispatch(fetchMembers(spaceId, side)).then(() => {
          expect(API.getMembers.mock.calls.length).toEqual(1)
          expect(API.getMembers.mock.calls[0][1]).toEqual(expectedQuery)
        })
      })
    })

    describe('when members Side is not given', () => {
      const store = mockStore(reducer({
        spaces: {
          members: {},
        },
      }, { type: undefined }))

      it("doesn't pass it to API call", () => {
        return store.dispatch(fetchMembers(spaceId, side)).then(() => {
          expect(API.getMembers.mock.calls.length).toEqual(1)
          expect(API.getMembers.mock.calls[0][1]).toEqual({ side: null })
        })
      })
    })
  })
})
