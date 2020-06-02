export const contextSelector = state => state.context
export const isInitializedSelector = state => state.context.isInitialized
export const createSpaceLinkSelector = state => contextSelector(state).links.space_create
export const contextLinksSelector = state => contextSelector(state).links
