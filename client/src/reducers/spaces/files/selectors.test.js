import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const links = 'links'
  const entries = 'entries'
  const isCheckedAll = false
  const isFetching = 'isFetching'
  const sortType = 'name'
  const sortDirection = 'ASC'
  const addFolderModal = {
    isOpen: false,
    isLoading: false,
  }
  const actionModal = {
    isOpen: false,
    isLoading: false,
  }
  const renameModal = {
    isOpen: false,
    isLoading: false,
  }
  const copyModal = {
    isOpen: false,
    isLoading: false,
  }

  const state = reducer({
    spaces: {
      files: {
        links,
        entries,
        isCheckedAll,
        isFetching,
        sortType,
        sortDirection,
        addFolderModal,
        actionModal,
        renameModal,
        copyModal,
      },
    },
  }, { type: undefined })

  it('spaceFilesSelector()', () => {
    expect(S.spaceFilesSelector(state)).toEqual(entries)
  })

  it('spaceFilesCheckedAllSelector()', () => {
    expect(S.spaceFilesCheckedAllSelector(state)).toBe(isCheckedAll)
  })

  it('spaceIsFetchingFilesSelector()', () => {
    expect(S.spaceIsFetchingFilesSelector(state)).toEqual(isFetching)
  })

  it('spaceAppsListSortTypeSelector()', () => {
    expect(S.spaceFilesListSortTypeSelector(state)).toEqual(sortType)
  })

  it('spaceAppsListSortDirectionSelector()', () => {
    expect(S.spaceFilesListSortDirectionSelector(state)).toEqual(sortDirection)
  })

  it('spaceFilesAddFolderModalSelector()', () => {
    expect(S.spaceFilesAddFolderModalSelector(state)).toEqual(addFolderModal)
  })

  it('spaceFilesActionModalSelector()', () => {
    expect(S.spaceFilesActionModalSelector(state)).toEqual(actionModal)
  })

  it('spaceFilesLinksSelector()', () => {
    expect(S.spaceFilesLinksSelector(state)).toEqual(links)
  })

  it('spaceFilesRenameModalSelector()', () => {
    expect(S.spaceFilesRenameModalSelector(state)).toEqual(renameModal)
  })

  it('spaceFilesCopyModalSelector()', () => {
    expect(S.spaceFilesCopyModalSelector(state)).toEqual(copyModal)
  })
})
