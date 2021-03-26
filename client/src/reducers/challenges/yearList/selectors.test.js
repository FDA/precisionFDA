import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const yearList = [ 'challenge 1', 'challenge 2' ]
  const isFetching = true
  const state = reducer({
    challenges: {
      yearList: {
        yearList,
        isFetching,
      },
    },
  }, { type: undefined })


  it('challengesListYearSelector()', () => {
    expect(S.challengesYearListSelector(state)).toEqual(yearList)
  })

  it('challengesListPaginationSelector()', () => {
    expect(S.challengesYearListIsFetchingSelector(state)).toEqual(isFetching)
  })
})
