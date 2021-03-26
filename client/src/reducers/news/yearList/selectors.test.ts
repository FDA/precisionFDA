import * as S from './selectors'
import reducer from '../../index'

describe('selectors', () => {
  const items = [ 2010, 2011 ]
  const state = {
    news: {
      yearList: {
        yearList: items,
      }
    }
  }

  it('newsYearListSelector()', () => {
    expect(S.newsYearListSelector(state)).toEqual(items)
  })
})
