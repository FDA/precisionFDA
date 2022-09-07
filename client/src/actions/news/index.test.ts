import {
  newsListSetPage,
} from '.'

import {
  NEWS_LIST_SET_PAGE
} from './types'

describe('fetchNews()', () => {
  it('creates correct action', () => {
    const page = 123
    expect(newsListSetPage(page)).toEqual({
      type: NEWS_LIST_SET_PAGE,
      payload: 123
    })
  })
})
