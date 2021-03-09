import { HOME_ENTRIES_TYPES } from '../../../constants'


export const homeAssetsListSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.PRIVATE].assets
export const homeAssetsIsFetchingSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.PRIVATE].isFetching
export const homeAssetsIsCheckedAllSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.PRIVATE].isCheckedAll
export const homeAssetsFiltersSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.PRIVATE].filters

export const homeAssetsFeaturedListSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.FEATURED].assets
export const homeAssetsFeaturedIsFetchingSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.FEATURED].isFetching
export const homeAssetsFeaturedIsCheckedAllSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.FEATURED].isCheckedAll
export const homeAssetsFeaturedFiltersSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.FEATURED].filters

export const homeAssetsEverybodyListSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.EVERYBODY].assets
export const homeAssetsEverybodyIsFetchingSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.EVERYBODY].isFetching
export const homeAssetsEverybodyIsCheckedAllSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.EVERYBODY].isCheckedAll
export const homeAssetsEverybodyFiltersSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.EVERYBODY].filters

export const homeAssetsSpacesListSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.SPACES].assets
export const homeAssetsSpacesIsFetchingSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.SPACES].isFetching
export const homeAssetsSpacesIsCheckedAllSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.SPACES].isCheckedAll
export const homeAssetsSpacesFiltersSelector = (state) => state.home.assets[HOME_ENTRIES_TYPES.SPACES].filters

export const homeAssetsAssetDetailsSelector = (state) => state.home.assets.assetDetails

export const homeAssetsEditTagsModalSelector = (state) => state.home.assets.editTagsModal
export const homeAssetsAttachToModalSelector = (state) => state.home.assets.attachToModal
export const homeAssetsRenameModalSelector = (state) => state.home.assets.renameModal
export const homeAssetsDownloadModalSelector = (state) => state.home.assets.downloadModal
export const homeAssetsDeleteModalSelector = (state) => state.home.assets.deleteModal
export const homeAssetsAttachLicenseModalSelector = (state) => state.home.assets.attachLicenseModal
export const homeAssetsLicenseModalSelector = (state) => state.home.assets.licenseModal
