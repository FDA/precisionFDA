export const contextSelector = state => state.context
export const contextIsFetchingSelector = state => state.context.isFetching
export const isInitializedSelector = state => state.context.isInitialized
export const createSpaceLinkSelector = state => contextSelector(state).links.space_create
export const contextLinksSelector = state => contextSelector(state).links
export const contextUserSelector = state => contextSelector(state).user
