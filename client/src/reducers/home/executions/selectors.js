import { HOME_ENTRIES_TYPES } from '../../../constants'


export const homeExecutionsListSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.PRIVATE].executions
export const homeExecutionsIsFetchingSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.PRIVATE].isFetching
export const homeExecutionsIsCheckedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.PRIVATE].isCheckedAll
export const homeExecutionsFiltersSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.PRIVATE].filters
export const homeExecutionsIsExpandedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.PRIVATE].isExpandedAll

export const homeExecutionsSpacesListSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.SPACES].executions
export const homeExecutionsSpacesIsFetchingSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.SPACES].isFetching
export const homeExecutionsSpacesIsCheckedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.SPACES].isCheckedAll
export const homeExecutionsSpacesFiltersSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.SPACES].filters
export const homeExecutionsSpacesIsExpandedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.SPACES].isExpandedAll

export const homeExecutionsEverybodyListSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.EVERYBODY].executions
export const homeExecutionsEverybodyIsFetchingSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.EVERYBODY].isFetching
export const homeExecutionsEverybodyIsCheckedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.EVERYBODY].isCheckedAll
export const homeExecutionsEverybodyFiltersSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.EVERYBODY].filters
export const homeExecutionsEverybodyIsExpandedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.EVERYBODY].isExpandedAll

export const homeExecutionsFeaturedListSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.FEATURED].executions
export const homeExecutionsFeaturedIsFetchingSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.FEATURED].isFetching
export const homeExecutionsFeaturedIsCheckedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.FEATURED].isCheckedAll
export const homeExecutionsFeaturedFiltersSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.FEATURED].filters
export const homeExecutionsFeaturedIsExpandedAllSelector = (state) => state.home.executions[HOME_ENTRIES_TYPES.FEATURED].isExpandedAll

export const homeExecutionsDetailsSelector = (state) => state.home.executions.executionDetails
export const homeExecutionsCopyToSpaceModalSelector = (state) => state.home.executions.copyToSpaceModal
export const homeExecutionsAttachToModalSelector = (state) => state.home.executions.attachToModal
export const homeExecutionsTerminateModalSelector = (state) => state.home.executions.terminateModal
export const homeExecutionsEditTagsModalSelector = (state) => state.home.executions.editTagsModal
