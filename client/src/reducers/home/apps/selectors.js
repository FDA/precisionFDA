export const homeAppsListSelector = (state) => state.home.apps.privateApps.apps
export const homeAppsIsFetchingSelector = (state) => state.home.apps.privateApps.isFetching
export const homeAppsIsCheckedAllSelector = (state) => state.home.apps.privateApps.isCheckedAll

export const homeAppsFeaturedListSelector = (state) => state.home.apps.featuredApps.apps
export const homeAppsFeaturedIsFetchingSelector = (state) => state.home.apps.featuredApps.isFetching
export const homeAppsFeaturedIsCheckedAllSelector = (state) => state.home.apps.featuredApps.isCheckedAll
