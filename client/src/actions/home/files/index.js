import { createAction } from '../../../utils/redux'
import {
  HOME_FILES_TOGGLE_ALL_CHECKBOXES,
  HOME_FILES_TOGGLE_CHECKBOX,
  HOME_FILES_RESET_MODALS,
  HOME_FILES_SHOW_MODAL,
  HOME_FILES_HIDE_MODAL,
  HOME_FILES_SET_FILTER_VALUE,
  HOME_FILES_RESET_FILTERS,
} from '../types'
import { HOME_FILE_TYPES, HOME_FILES_MODALS } from '../../../constants' 
import fetchFiles from './fetchFiles'
import fetchFilesFeatured from './fetchFilesFeatured'
import fetchFilesEverybody from './fetchFilesEverybody'
import fetchFilesSpaces from './fetchFilesSpaces'
import fetchFileDetails from './fetchFileDetails'
import renameFile from './renameFile'
import createFolder from './createFolder'
import fetchFilesByAction from './fetchFilesByAction'
import { filesMove, fetchSubfolders } from './moveFile'


const toggleAllFilesCheckboxes = () => createAction(HOME_FILES_TOGGLE_ALL_CHECKBOXES, HOME_FILE_TYPES.PRIVATE)
const toggleFileCheckbox = (id) => createAction(HOME_FILES_TOGGLE_CHECKBOX, { filesType: HOME_FILE_TYPES.PRIVATE, id })
const setFileFilterValue = (value) => createAction(HOME_FILES_SET_FILTER_VALUE, { filesType: HOME_FILE_TYPES.PRIVATE, value })
const resetFilesFiltersValue = () => createAction(HOME_FILES_RESET_FILTERS, { filesType: HOME_FILE_TYPES.PRIVATE })

const toggleAllFilesFeaturedCheckboxes = () => createAction(HOME_FILES_TOGGLE_ALL_CHECKBOXES, HOME_FILE_TYPES.FEATURED)
const toggleFileFeaturedCheckbox = (id) => createAction(HOME_FILES_TOGGLE_CHECKBOX, { filesType: HOME_FILE_TYPES.FEATURED, id })
const setFileFeaturedFilterValue = (value) => createAction(HOME_FILES_SET_FILTER_VALUE, { filesType: HOME_FILE_TYPES.FEATURED, value })
const resetFilesFeaturedFiltersValue = () => createAction(HOME_FILES_RESET_FILTERS, { filesType: HOME_FILE_TYPES.FEATURED })

const toggleAllFilesEverybodyCheckboxes = () => createAction(HOME_FILES_TOGGLE_ALL_CHECKBOXES, HOME_FILE_TYPES.EVERYBODY)
const toggleFileEverybodyCheckbox = (id) => createAction(HOME_FILES_TOGGLE_CHECKBOX, { filesType: HOME_FILE_TYPES.EVERYBODY, id })
const setFileEverybodyFilterValue = (value) => createAction(HOME_FILES_SET_FILTER_VALUE, { filesType: HOME_FILE_TYPES.EVERYBODY, value })
const resetFilesEverybodyFiltersValue = () => createAction(HOME_FILES_RESET_FILTERS, { filesType: HOME_FILE_TYPES.EVERYBODY })

const toggleAllFilesSpacesCheckboxes = () => createAction(HOME_FILES_TOGGLE_ALL_CHECKBOXES, HOME_FILE_TYPES.SPACES)
const toggleFileSpacesCheckbox = (id) => createAction(HOME_FILES_TOGGLE_CHECKBOX, { filesType: HOME_FILE_TYPES.SPACES, id })
const setFileSpacesFilterValue = (value) => createAction(HOME_FILES_SET_FILTER_VALUE, { filesType: HOME_FILE_TYPES.SPACES, value })
const resetFilesSpacesFiltersValue = () => createAction(HOME_FILES_RESET_FILTERS, { filesType: HOME_FILE_TYPES.SPACES })

const resetFilesModals = () => createAction(HOME_FILES_RESET_MODALS)

const showFilesCopyToSpaceModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.COPY_TO_SPACE)
const hideFilesCopyToSpaceModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.COPY_TO_SPACE)

const showFilesAddFolderModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.ADD_FOLDER)
const hideFilesAddFolderModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.ADD_FOLDER)

const showUploadModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.UPLOAD_FILE)
const hideUploadModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.UPLOAD_FILE)

const showFilesRenameModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.RENAME)
const hideFilesRenameModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.RENAME)

const showFilesMakePublicModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.MAKE_PUBLIC)
const hideFilesMakePublicModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.MAKE_PUBLIC)

const showFilesDeleteModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.DELETE)
const hideFilesDeleteModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.DELETE)

const showFilesAttachToModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.ATTACH_TO)
const hideFilesAttachToModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.ATTACH_TO)

const showFilesMoveModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.MOVE)
const hideFilesMoveModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.MOVE)

const showFilesAttachLicenseModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.ATTACH_LICENSE)
const hideFilesAttachLicenseModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.ATTACH_LICENSE)

const showFileEditTagsModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.EDIT_TAGS)
const hideFileEditTagsModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.EDIT_TAGS)

const showFilesLicenseModal = () => createAction(HOME_FILES_SHOW_MODAL, HOME_FILES_MODALS.LICENSE)
const hideFilesLicenseModal = () => createAction(HOME_FILES_HIDE_MODAL, HOME_FILES_MODALS.LICENSE)

export {
  fetchFiles,
  fetchFilesFeatured,
  fetchFilesEverybody,
  fetchFilesSpaces,
  fetchFileDetails,
  renameFile,
  createFolder,
  filesMove,
  fetchSubfolders,
  toggleAllFilesCheckboxes,
  toggleFileCheckbox,
  setFileFilterValue,
  resetFilesFiltersValue,
  setFileFeaturedFilterValue,
  resetFilesFeaturedFiltersValue,
  setFileEverybodyFilterValue,
  resetFilesEverybodyFiltersValue,
  setFileSpacesFilterValue,
  resetFilesSpacesFiltersValue,
  toggleAllFilesFeaturedCheckboxes,
  toggleFileFeaturedCheckbox,
  toggleAllFilesEverybodyCheckboxes,
  toggleFileEverybodyCheckbox,
  toggleAllFilesSpacesCheckboxes,
  toggleFileSpacesCheckbox,
  resetFilesModals,
  showFilesRenameModal,
  hideFilesRenameModal,
  showFilesCopyToSpaceModal,
  hideFilesCopyToSpaceModal,
  showFilesMakePublicModal,
  hideFilesMakePublicModal,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  showUploadModal,
  hideUploadModal,
  showFilesDeleteModal,
  hideFilesDeleteModal,
  showFilesAttachToModal,
  hideFilesAttachToModal,
  showFilesMoveModal,
  hideFilesMoveModal,
  showFilesAttachLicenseModal,
  hideFilesAttachLicenseModal,
  fetchFilesByAction,
  showFileEditTagsModal,
  hideFileEditTagsModal,
  showFilesLicenseModal,
  hideFilesLicenseModal,
}
