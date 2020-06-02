import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const entries = ['workflow-1']
  const isFetching = true
  const sortType = 'name'
  const sortDirection = 'ASC'
  const isCheckedAll = false
  const copyModal = {
    isOpen: false,
    isLoading: false,
  }
  const links = false

  const state = reducer({
    spaces: {
      workflows: {
        entries,
        isFetching,
        sortType,
        sortDirection,
        isCheckedAll,
        copyModal,
        links,
      },
    },
  }, { type: undefined })

  it('spaceWorkflowsListIsFetchingSelector()', () => {
    expect(S.spaceWorkflowsListIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('spaceAppsListSelector()', () => {
    expect(S.spaceWorkflowsListSelector(state)).toEqual(entries)
  })

  it('spaceAppsListSortTypeSelector()', () => {
    expect(S.spaceWorkflowsListSortTypeSelector(state)).toEqual(sortType)
  })

  it('spaceWorkflowsListSortDirectionSelector()', () => {
    expect(S.spaceWorkflowsListSortDirectionSelector(state)).toEqual(sortDirection)
  })

  it('spaceWorkflowsCheckedAllSelector()', () => {
    expect(S.spaceWorkflowsCheckedAllSelector(state)).toEqual(isCheckedAll)
  })

  it('spaceWorkflowsCopyModalSelector()', () => {
    expect(S.spaceWorkflowsCopyModalSelector(state)).toEqual(copyModal)
  })

  it('spaceWorkflowsLinksSelector()', () => {
    expect(S.spaceWorkflowsLinksSelector(state)).toEqual(links)
  })
})
