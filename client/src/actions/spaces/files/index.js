import { createAction } from '../../../utils/redux'
import {
  SPACE_FILES_RESET_FILTERS,
  SPACE_FILES_SHOW_ADD_FOLDER_MODAL,
  SPACE_FILES_HIDE_ADD_FOLDER_MODAL,
  SPACE_FILES_TOGGLE_CHECKBOX,
  SPACE_FILES_TOGGLE_ALL_CHECKBOXES,
  SPACE_FILES_SHOW_ACTION_MODAL,
  SPACE_FILES_HIDE_ACTION_MODAL,
  SPACE_FILES_SHOW_RENAME_MODAL,
  SPACE_FILES_HIDE_RENAME_MODAL,
  SPACE_FILES_SHOW_COPY_MODAL,
  SPACE_FILES_HIDE_COPY_MODAL,
  SPACE_SELECT_ACCESSIBLE_SPACE,
} from '../types'
import fetchFiles from './fetchFiles'
import sortFiles from './sortFiles'
import fetchFilesByAction from './fetchFilesByAction'
import publishFiles from './publishFiles'
import deleteFiles from './deleteFiles'
import renameFile from './renameFile'
import createFolder from './createFolder'
import fetchAccessibleFiles from './fetchAccessibleFiles'


const resetSpaceFilesFilters = () => createAction(SPACE_FILES_RESET_FILTERS)

const showFilesAddFolderModal = () => createAction(SPACE_FILES_SHOW_ADD_FOLDER_MODAL)
const hideFilesAddFolderModal = () => createAction(SPACE_FILES_HIDE_ADD_FOLDER_MODAL)

const toggleFileCheckbox = (id) => createAction(SPACE_FILES_TOGGLE_CHECKBOX, id)
const toggleAllFileCheckboxes = () => createAction(SPACE_FILES_TOGGLE_ALL_CHECKBOXES)

const showFilesActionModal = (action) => createAction(SPACE_FILES_SHOW_ACTION_MODAL, action)
const hideFilesActionModal = () => createAction(SPACE_FILES_HIDE_ACTION_MODAL)

const showFilesRenameModal = () => createAction(SPACE_FILES_SHOW_RENAME_MODAL)
const hideFilesRenameModal = () => createAction(SPACE_FILES_HIDE_RENAME_MODAL)

const showFilesCopyModal = () => createAction(SPACE_FILES_SHOW_COPY_MODAL)
const hideFilesCopyModal = () => createAction(SPACE_FILES_HIDE_COPY_MODAL)

const selectAccessibleSpace = (scope) => createAction(SPACE_SELECT_ACCESSIBLE_SPACE, scope)

export {
  fetchFiles,
  sortFiles,
  fetchFilesByAction,
  resetSpaceFilesFilters,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  toggleFileCheckbox,
  toggleAllFileCheckboxes,
  showFilesActionModal,
  hideFilesActionModal,
  publishFiles,
  deleteFiles,
  showFilesRenameModal,
  hideFilesRenameModal,
  renameFile,
  createFolder,
  showFilesCopyModal,
  hideFilesCopyModal,
  selectAccessibleSpace,
  fetchAccessibleFiles,
}
