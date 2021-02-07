import { HOME_APP_TYPES } from '../../../constants'


export const homeAppsListSelector = (state) => state.home.apps[HOME_APP_TYPES.PRIVATE].apps
export const homeAppsIsFetchingSelector = (state) => state.home.apps[HOME_APP_TYPES.PRIVATE].isFetching
export const homeAppsIsCheckedAllSelector = (state) => state.home.apps[HOME_APP_TYPES.PRIVATE].isCheckedAll
export const homeAppsFiltersSelector = (state) => state.home.apps[HOME_APP_TYPES.PRIVATE].filters

export const homeAppsFeaturedListSelector = (state) => state.home.apps[HOME_APP_TYPES.FEATURED].apps
export const homeAppsFeaturedIsFetchingSelector = (state) => state.home.apps[HOME_APP_TYPES.FEATURED].isFetching
export const homeAppsFeaturedIsCheckedAllSelector = (state) => state.home.apps[HOME_APP_TYPES.FEATURED].isCheckedAll
export const homeAppsFeaturedFiltersSelector = (state) => state.home.apps[HOME_APP_TYPES.FEATURED].filters

export const homeAppsEverybodyListSelector = (state) => state.home.apps[HOME_APP_TYPES.EVERYBODY].apps
export const homeAppsEverybodyIsFetchingSelector = (state) => state.home.apps[HOME_APP_TYPES.EVERYBODY].isFetching
export const homeAppsEverybodyIsCheckedAllSelector = (state) => state.home.apps[HOME_APP_TYPES.EVERYBODY].isCheckedAll
export const homeAppsEverybodyFiltersSelector = (state) => state.home.apps[HOME_APP_TYPES.EVERYBODY].filters

export const homeAppsSpacesListSelector = (state) => state.home.apps[HOME_APP_TYPES.SPACES].apps
export const homeAppsSpacesIsFetchingSelector = (state) => state.home.apps[HOME_APP_TYPES.SPACES].isFetching
export const homeAppsSpacesIsCheckedAllSelector = (state) => state.home.apps[HOME_APP_TYPES.SPACES].isCheckedAll
export const homeAppsSpacesFiltersSelector = (state) => state.home.apps[HOME_APP_TYPES.SPACES].filters

export const homeAppsAppDetailsSelector = (state) => state.home.apps.appDetails
export const homeAppsAppExecutionsSelector = (state) => state.home.apps.appExecutions

export const homeAppsCopyToSpaceModalSelector = (state) => state.home.apps.copyToSpaceModal
export const homeAppsAssignToChallengeModalSelector = (state) => state.home.apps.assignToChallengeModal
export const homeAppsEditTagsModalSelector = (state) => state.home.apps.editTagsModal
export const homeAppsAttachToModalSelector = (state) => state.home.apps.appsAttachToModal
export const homeAppsComparisonModalSelector = (state) => state.home.apps.comparisonModal
export const homeAppsDeleteModalSelector = (state) => state.home.apps.deleteModal
