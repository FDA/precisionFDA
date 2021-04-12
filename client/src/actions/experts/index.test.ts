import {
  expertsListSetPage,
} from '.'

import {
  EXPERTS_LIST_SET_PAGE
} from './types'

describe('fetchExperts()', () => {
  it('creates correct action', () => {
    const page = 123
    expect(expertsListSetPage(page)).toEqual({
      type: EXPERTS_LIST_SET_PAGE,
      payload: 123
    })
  })
})
