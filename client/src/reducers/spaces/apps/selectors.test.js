import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const entries = ['app-1']
  const isFetching = true
  const sortType = 'name'
  const sortDirection = 'ASC'
  const isCheckedAll = false
  const accessibleApps = []
  const accessibleAppsLoading = false
  const copyModal = {
    isOpen: false,
    isLoading: false,
  }
  const copyToPrivate = {
    isCopying: false,
  }
  const links = {}

  const state = reducer({
    spaces: {
      apps: {
        entries,
        isFetching,
        sortType,
        sortDirection,
        isCheckedAll,
        accessibleApps,
        accessibleAppsLoading,
        copyModal,
        copyToPrivate,
        links,
      },
    },
  }, { type: undefined })

  it('spaceAppsListIsFetchingSelector()', () => {
    expect(S.spaceAppsListIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('spaceAppsListSelector()', () => {
    expect(S.spaceAppsListSelector(state)).toEqual(entries)
  })

  it('spaceAppsListSortTypeSelector()', () => {
    expect(S.spaceAppsListSortTypeSelector(state)).toEqual(sortType)
  })

  it('spaceAppsListSortDirectionSelector()', () => {
    expect(S.spaceAppsListSortDirectionSelector(state)).toEqual(sortDirection)
  })

  it('spaceAppsCheckedAllSelector()', () => {
    expect(S.spaceAppsCheckedAllSelector(state)).toEqual(isCheckedAll)
  })

  it('spaceAppsCopyModalSelector()', () => {
    expect(S.spaceAppsCopyModalSelector(state)).toEqual(copyModal)
  })

  it('spaceAppsCopyToPrivateSelector()', () => {
    expect(S.spaceAppsCopyToPrivateSelector(state)).toEqual(copyToPrivate)
  })

  it('spaceAppsLinksSelector()', () => {
    expect(S.spaceAppsLinksSelector(state)).toEqual(links)
  })
})
