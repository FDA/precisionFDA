import * as S from './selectors'
import reducer from '../../index'

describe('selectors', () => {
  const items = [ "new 1", "new 2" ]
  const year = 2010
  const pagination = 'pagination'
  const state = {
    news: {
      list: {
        items,
        year,
        pagination
      }
    },
  }

  it('newsListItemsSelector()', () => {
    expect(S.newsListItemsSelector(state)).toEqual(items)
  })

  it('newsListYearSelector()', () => {
    expect(S.newsListYearSelector(state)).toEqual(year)
  })

  it('newsListPaginationSelector()', () => {
    expect(S.newsListPaginationSelector(state)).toEqual(pagination)
  })
})
