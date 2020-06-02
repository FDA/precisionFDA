import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const entries = ['job-1']
  const isFetching = true
  const sortType = 'name'
  const sortDirection = 'ASC'

  const state = reducer({
    spaces: {
      jobs: {
        entries,
        isFetching,
        sortType,
        sortDirection,
      },
    },
  }, { type: undefined })

  it('spaceJobsListIsFetchingSelector()', () => {
    expect(S.spaceJobsListIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('spaceJobsListSelector()', () => {
    expect(S.spaceJobsListSelector(state)).toEqual(entries)
  })

  it('spaceJobsListSortTypeSelector()', () => {
    expect(S.spaceJobsListSortTypeSelector(state)).toEqual(sortType)
  })

  it('spaceJobsListSortDirectionSelector()', () => {
    expect(S.spaceJobsListSortDirectionSelector(state)).toEqual(sortDirection)
  })
})
