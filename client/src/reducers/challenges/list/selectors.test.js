import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const items = [ 'challenge 1', 'challenge 2' ]
  const searchString = 'searchString'
  const pagination = 'pagination'
  const state = reducer({
    challenges: {
      list: {
        items,
        searchString,
        pagination,
      },
    },
  }, { type: undefined })


  it('challengesListSearchStringSelector()', () => {
    expect(S.challengesListSearchStringSelector(state)).toEqual(searchString)
  })

  it('challengesListPaginationSelector()', () => {
    expect(S.challengesListPaginationSelector(state)).toEqual(pagination)
  })
})
