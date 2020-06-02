import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const viewType = 'view type'
  const entries = 'entries'
  const isFetching = 'isFetching'
  const sortType = 'sortType'
  const sortDirection = 'sortDirection'
  const searchString = 'searchString'
  const pagination = 'pagination'
  const state = reducer({
    spaces: {
      list: {
        viewType,
        entries,
        isFetching,
        sortType,
        sortDirection,
        searchString,
        pagination,
      },
    },
  }, { type: undefined })


  it('listViewTypeSelector()', () => {
    expect(S.listViewTypeSelector(state)).toEqual(viewType)
  })

  it('spacesListSelector()', () => {
    expect(S.spacesListSelector(state)).toEqual(entries)
  })

  it('spacesListIsFetchingSelector()', () => {
    expect(S.spacesListIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('spacesListSortTypeSelector()', () => {
    expect(S.spacesListSortTypeSelector(state)).toEqual(sortType)
  })

  it('spacesListSortDirectionSelector()', () => {
    expect(S.spacesListSortDirectionSelector(state)).toEqual(sortDirection)
  })

  it('spacesListSearchStringSelector()', () => {
    expect(S.spacesListSearchStringSelector(state)).toEqual(searchString)
  })

  it('spacesListPaginationSelector()', () => {
    expect(S.spacesListPaginationSelector(state)).toEqual(pagination)
  })
})
