import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const data = 'data'
  const isFetching = 'isFetching'
  const isSideMenuHidden = 'isSideMenuHidden'
  const isAccepting = 'isAccepting'
  const accessibleSpaces = 'accessibleSpaces'
  const accessibleSpacesLoading = 'accessibleSpacesLoading'
  const accessibleFiles = []
  const accessibleFilesLoading = false
  const accessibleApps = []
  const accessibleAppsLoading = false
  const accessibleWorkflows = []
  const accessibleWorkflowsLoading = false
  const lockSpaceModal = {
    isOpen: false,
    isLoading: false,
  }
  const unlockSpaceModal = {
    isOpen: false,
    isLoading: false,
  }
  const deleteSpaceModal = {
    isOpen: false,
    isLoading: false,
  }
  const spaceAddDataModal = {
    isOpen: false,
    isLoading: false,
  }

  const state = reducer({
    spaces: {
      space: {
        data,
        isFetching,
        isSideMenuHidden,
        isAccepting,
        lockSpaceModal,
        unlockSpaceModal,
        deleteSpaceModal,
        spaceAddDataModal,
        accessibleSpaces,
        accessibleSpacesLoading,
        accessibleFiles,
        accessibleFilesLoading,
        accessibleApps,
        accessibleAppsLoading,
        accessibleWorkflows,
        accessibleWorkflowsLoading,
      },
    },
  }, { type: undefined })


  it('spaceDataSelector()', () => {
    expect(S.spaceDataSelector(state)).toEqual(data)
  })

  it('spaceIsFetchingSelector()', () => {
    expect(S.spaceIsFetchingSelector(state)).toEqual(isFetching)
  })

  it('isSideMenuHiddenSelector()', () => {
    expect(S.isSideMenuHiddenSelector(state)).toEqual(isSideMenuHidden)
  })

  it('stateIsAcceptingSelector()', () => {
    expect(S.spaceIsAcceptingSelector(state)).toEqual(isAccepting)
  })

  it('spaceLayoutLockModalSelector()', () => {
    expect(S.spaceLayoutLockModalSelector(state)).toEqual(lockSpaceModal)
  })

  it('spaceLayoutUnlockModalSelector()', () => {
    expect(S.spaceLayoutUnlockModalSelector(state)).toEqual(unlockSpaceModal)
  })

  it('spaceLayoutDeleteModalSelector()', () => {
    expect(S.spaceLayoutDeleteModalSelector(state)).toEqual(deleteSpaceModal)
  })

  it('spaceAddDataModalSelector()', () => {
    expect(S.spaceAddDataModalSelector(state)).toEqual(spaceAddDataModal)
  })

  it('spaceAccessibleSpacesSelector()', () => {
    expect(S.spaceAccessibleSpacesSelector(state)).toEqual(accessibleSpaces)
  })

  it('spaceAccessibleSpacesLoadingSelector()', () => {
    expect(S.spaceAccessibleSpacesLoadingSelector(state)).toEqual(accessibleSpacesLoading)
  })

  it('spaceAccessibleFilesSelector()', () => {
    expect(S.spaceAccessibleFilesSelector(state)).toEqual(accessibleFiles)
  })

  it('spaceAccessibleFilesLoadingSelector()', () => {
    expect(S.spaceAccessibleFilesLoadingSelector(state)).toEqual(accessibleFilesLoading)
  })

  it('spaceAccessibleAppsSelector()', () => {
    expect(S.spaceAccessibleAppsSelector(state)).toEqual(accessibleApps)
  })

  it('spaceAccessibleAppsLoadingSelector()', () => {
    expect(S.spaceAccessibleAppsLoadingSelector(state)).toEqual(accessibleAppsLoading)
  })

  it('spaceAccessibleWorkflowsSelector()', () => {
    expect(S.spaceAccessibleWorkflowsSelector(state)).toEqual(accessibleWorkflows)
  })

  it('spaceAccessibleWorkflowsLoadingSelector()', () => {
    expect(S.spaceAccessibleWorkflowsLoadingSelector(state)).toEqual(accessibleWorkflowsLoading)
  })
})
