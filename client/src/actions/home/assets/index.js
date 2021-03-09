import { createAction } from '../../../utils/redux'
import fetchAssets from './fetchAssets'
import fetchAssetsEverybody from './fetchAssetsEverybody'
import fetchAssetsFeatured from './fetchAssetsFeatured'
import fetchAssetsSpaces from './fetchAssetsSpaces'
import fetchAssetDetails from './fetchAssetDetails'
import renameAsset from './renameAsset'
import { HOME_ENTRIES_TYPES, HOME_ASSETS_MODALS } from '../../../constants'
import {
  HOME_ASSETS_TOGGLE_ALL_CHECKBOXES,
  HOME_ASSETS_TOGGLE_CHECKBOX,
  HOME_ASSETS_SET_FILTER_VALUE,
  HOME_ASSETS_RESET_FILTERS,
  HOME_ASSETS_SHOW_MODAL,
  HOME_ASSETS_HIDE_MODAL,
} from './types'


const toggleAllAssetsCheckboxes = () => createAction(HOME_ASSETS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.PRIVATE)
const toggleAssetCheckbox = (id) => createAction(HOME_ASSETS_TOGGLE_CHECKBOX, { assetsType: HOME_ENTRIES_TYPES.PRIVATE, id })
const setAssetFilterValue = (value) => createAction(HOME_ASSETS_SET_FILTER_VALUE, { assetsType: HOME_ENTRIES_TYPES.PRIVATE, value })
const resetAssetsFiltersValue = () => createAction(HOME_ASSETS_RESET_FILTERS, { assetsType: HOME_ENTRIES_TYPES.PRIVATE })

const toggleAllAssetsFeaturedCheckboxes = () => createAction(HOME_ASSETS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.FEATURED)
const toggleAssetFeaturedCheckbox = (id) => createAction(HOME_ASSETS_TOGGLE_CHECKBOX, { assetsType: HOME_ENTRIES_TYPES.FEATURED, id })
const setAssetFeaturedFilterValue = (value) => createAction(HOME_ASSETS_SET_FILTER_VALUE, { assetsType: HOME_ENTRIES_TYPES.FEATURED, value })
const resetAssetsFeaturedFiltersValue = () => createAction(HOME_ASSETS_RESET_FILTERS, { assetsType: HOME_ENTRIES_TYPES.FEATURED })

const toggleAllAssetsEverybodyCheckboxes = () => createAction(HOME_ASSETS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.EVERYBODY)
const toggleAssetEverybodyCheckbox = (id) => createAction(HOME_ASSETS_TOGGLE_CHECKBOX, { assetsType: HOME_ENTRIES_TYPES.EVERYBODY, id })
const setAssetEverybodyFilterValue = (value) => createAction(HOME_ASSETS_SET_FILTER_VALUE, { assetsType: HOME_ENTRIES_TYPES.EVERYBODY, value })
const resetAssetsEverybodyFiltersValue = () => createAction(HOME_ASSETS_RESET_FILTERS, { assetsType: HOME_ENTRIES_TYPES.EVERYBODY })

const toggleAllAssetsSpacesCheckboxes = () => createAction(HOME_ASSETS_TOGGLE_ALL_CHECKBOXES, HOME_ENTRIES_TYPES.SPACES)
const toggleAssetSpacesCheckbox = (id) => createAction(HOME_ASSETS_TOGGLE_CHECKBOX, { assetsType: HOME_ENTRIES_TYPES.SPACES, id })
const setAssetSpacesFilterValue = (value) => createAction(HOME_ASSETS_SET_FILTER_VALUE, { assetsType: HOME_ENTRIES_TYPES.SPACES, value })
const resetAssetsSpacesFiltersValue = () => createAction(HOME_ASSETS_RESET_FILTERS, { assetsType: HOME_ENTRIES_TYPES.SPACES })

const showAssetsEditTagsModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.EDIT_TAGS)
const hideAssetsEditTagsModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.EDIT_TAGS)
const showAssetsAttachToModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.ATTACH_TO)
const hideAssetsAttachToModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.ATTACH_TO)
const showAssetsRenameModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.RENAME)
const hideAssetsRenameModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.RENAME)
const showAssetsDeleteModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.DELETE)
const hideAssetsDeleteModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.DELETE)
const showAssetsDownloadModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.DOWNLOAD)
const hideAssetsDownloadModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.DOWNLOAD)
const showAssetsAttachLicenseModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.ATTACH_LICENSE)
const hideAssetsAttachLicenseModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.ATTACH_LICENSE)
const showAssetsLicenseModal = () => createAction(HOME_ASSETS_SHOW_MODAL, HOME_ASSETS_MODALS.LICENSE)
const hideAssetsLicenseModal = () => createAction(HOME_ASSETS_HIDE_MODAL, HOME_ASSETS_MODALS.LICENSE)

export {
  fetchAssets,
  fetchAssetsEverybody,
  fetchAssetsFeatured,
  fetchAssetsSpaces,
  fetchAssetDetails,
  renameAsset,
  toggleAllAssetsCheckboxes,
  toggleAssetCheckbox,
  setAssetFilterValue,
  resetAssetsFiltersValue,
  toggleAllAssetsFeaturedCheckboxes,
  toggleAssetFeaturedCheckbox,
  setAssetFeaturedFilterValue,
  resetAssetsFeaturedFiltersValue,
  toggleAllAssetsEverybodyCheckboxes,
  toggleAssetEverybodyCheckbox,
  setAssetEverybodyFilterValue,
  resetAssetsEverybodyFiltersValue,
  toggleAllAssetsSpacesCheckboxes,
  toggleAssetSpacesCheckbox,
  setAssetSpacesFilterValue,
  resetAssetsSpacesFiltersValue,
  showAssetsEditTagsModal,
  hideAssetsEditTagsModal,
  showAssetsAttachToModal,
  hideAssetsAttachToModal,
  showAssetsRenameModal,
  hideAssetsRenameModal,
  showAssetsDeleteModal,
  hideAssetsDeleteModal,
  showAssetsDownloadModal,
  hideAssetsDownloadModal,
  showAssetsAttachLicenseModal,
  hideAssetsAttachLicenseModal,
  showAssetsLicenseModal,
  hideAssetsLicenseModal,
}
