import { mockStore } from '../../../../test/helper'
import  sortSpaces from './index'
import reducer from '../../../reducers'
import { SPACES_SORT_SPACES_TABLE } from '../types'
import { SORT_ASC, SORT_DESC } from '../../../constants'


describe('sortSpaces()', () => {
  describe('when previous ordering type is not equal to new', () => {
    it('returns correct action', () => {
      const store = mockStore(reducer({
        spaces: {
          list: {
            sortType: 'some type',
            sortDirection: 'some direction',
          },
        },
      }, { type: undefined }))

      const type = 'some new type'
      const action = store.dispatch(sortSpaces(type))

      expect(action).toEqual({
        type: SPACES_SORT_SPACES_TABLE,
        payload: {
          type,
          direction: SORT_ASC,
        },
      })
    })
  })

  describe('when order direction is empty', () => {
    it('returns correct action', () => {
      const store = mockStore(reducer({
        spaces: {
          list: {
            sortType: 'some type',
            sortDirection: null,
          },
        },
      }, { type: undefined }))

      const type = 'some type'
      const action = store.dispatch(sortSpaces(type))

      expect(action).toEqual({
        type: SPACES_SORT_SPACES_TABLE,
        payload: {
          type,
          direction: SORT_ASC,
        },
      })
    })
  })

  describe('when order direction is asc', () => {
    it('returns correct action', () => {
      const store = mockStore(reducer({
        spaces: {
          list: {
            sortType: 'some type',
            sortDirection: SORT_ASC,
          },
        },
      }, { type: undefined }))

      const type = 'some type'
      const action = store.dispatch(sortSpaces(type))

      expect(action).toEqual({
        type: SPACES_SORT_SPACES_TABLE,
        payload: {
          type,
          direction: SORT_DESC,
        },
      })
    })
  })

  describe('when prev type equals to new, and direction is neither null nor asc', () => {
    it('returns correct action', () => {
      const store = mockStore(reducer({
        spaces: {
          list: {
            sortType: 'some type',
            sortDirection: SORT_DESC,
          },
        },
      }, { type: undefined }))

      const type = 'some type'
      const action = store.dispatch(sortSpaces(type))

      expect(action).toEqual({
        type: SPACES_SORT_SPACES_TABLE,
        payload: {
          type: null,
          direction: null,
        },
      })
    })
  })
})
