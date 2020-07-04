export const spaceDataSelector = (state) => state.spaces.space.data
export const spaceIsFetchingSelector = (state) => state.spaces.space.isFetching
export const isSideMenuHiddenSelector = (state) => state.spaces.space.isSideMenuHidden
export const spaceIsAcceptingSelector = (state) => state.spaces.space.isAccepting
export const spaceCanDuplicateSelector = (state) => state.spaces.space.data.canDuplicate

export const spaceLayoutLockModalSelector = (state) => state.spaces.space.lockSpaceModal
export const spaceLayoutUnlockModalSelector = (state) => state.spaces.space.unlockSpaceModal
export const spaceLayoutDeleteModalSelector = (state) => state.spaces.space.deleteSpaceModal

export const spaceAddDataModalSelector = (state) => state.spaces.space.spaceAddDataModal

export const spaceAccessibleSpacesSelector = (state) => state.spaces.space.accessibleSpaces
export const spaceAccessibleSpacesLoadingSelector = (state) => state.spaces.space.accessibleSpacesLoading

export const spaceAccessibleFilesSelector = (state) => state.spaces.space.accessibleFiles
export const spaceAccessibleFilesLoadingSelector = (state) => state.spaces.space.accessibleFilesLoading

export const spaceAccessibleAppsSelector = (state) => state.spaces.space.accessibleApps
export const spaceAccessibleAppsLoadingSelector = (state) => state.spaces.space.accessibleAppsLoading

export const spaceAccessibleWorkflowsSelector = (state) => state.spaces.space.accessibleWorkflows
export const spaceAccessibleWorkflowsLoadingSelector = (state) => state.spaces.space.accessibleWorkflowsLoading
