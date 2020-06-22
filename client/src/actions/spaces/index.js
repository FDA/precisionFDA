import { createAction } from '../../utils/redux'
import {
  SPACES_SWITCH_LIST_VIEW_TYPE,
  SPACES_LIST_SEARCH,
  SPACES_LIST_RESET_FILTERS,
  SPACE_SIDE_MENU_TOGGLE,
  SPACES_SET_PAGE,
  SPACE_LAYOUT_HIDE_LOCK_MODAL,
  SPACE_LAYOUT_SHOW_LOCK_MODAL,
  SPACE_LAYOUT_HIDE_UNLOCK_MODAL,
  SPACE_LAYOUT_SHOW_UNLOCK_MODAL,
  SPACE_LAYOUT_HIDE_DELETE_MODAL,
  SPACE_LAYOUT_SHOW_DELETE_MODAL,
  SPACE_HIDE_ADD_DATA_MODAL,
  SPACE_SHOW_ADD_DATA_MODAL,
  SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
} from './types'
import { fetchSpaces } from './fetchSpaces'
import { fetchSpaceLockToggle } from './fetchSpaceLockToggle'
import { fetchSpace } from './fetchSpace'
import { lockSpace } from './lockSpace'
import { unlockSpace } from './unlockSpace'
import { deleteSpace } from './deleteSpace'
import { addDataToSpace } from './addDataToSpace'
import sortSpacesList from './sortSpaces'
import {
  fetchApps,
  sortApps,
  resetSpaceAppsFilters,
  fetchAccessibleApps,
  toggleAppCheckbox,
  toggleAllAppCheckboxes,
  showAppsCopyModal,
  hideAppsCopyModal,
} from './apps'
import {
  fetchFiles,
  sortFiles,
  resetSpaceFilesFilters,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  toggleFileCheckbox,
  toggleAllFileCheckboxes,
  showFilesActionModal,
  hideFilesActionModal,
  fetchFilesByAction,
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
} from './files'
import {
  fetchWorkflows,
  sortWorkflows,
  resetSpaceWorkflowsFilters,
  fetchAccessibleWorkflows,
  toggleWorkflowCheckbox,
  toggleAllWorkflowCheckboxes,
  showWorkflowsCopyModal,
  hideWorkflowsCopyModal,
} from './workflows'
import {
  fetchMembers,
  inviteMembers,
  showAddMembersModal,
  hideAddMembersModal,
} from './members'
import { fetchJobs, sortJobs, resetSpaceJobsFilters } from './jobs'
import createSpace from './createSpace'
import fetchNewSpaceInfo from './fetchNewSpaceInfo'
import editSpace from './editSpace'
import fetchAccessibleSpaces from './fetchAccessibleSpaces'
import copyToSpace from './copyToSpace'
import copyToPrivate from './copyToPrivate'


const switchListViewType = (viewType) => createAction(SPACES_SWITCH_LIST_VIEW_TYPE, viewType)

const searchSpacesList = (searchString) => createAction(SPACES_LIST_SEARCH, searchString)

const resetSpacesListFilters = () => createAction(SPACES_LIST_RESET_FILTERS)

const spaceSideMenuToggle = () => createAction(SPACE_SIDE_MENU_TOGGLE)

const spacesSetPage = (page) => createAction(SPACES_SET_PAGE, page)

const hideLayoutLockModal = () => createAction(SPACE_LAYOUT_HIDE_LOCK_MODAL)
const showLayoutLockModal = () => createAction(SPACE_LAYOUT_SHOW_LOCK_MODAL)

const hideLayoutUnlockModal = () => createAction(SPACE_LAYOUT_HIDE_UNLOCK_MODAL)
const showLayoutUnlockModal = () => createAction(SPACE_LAYOUT_SHOW_UNLOCK_MODAL)

const hideLayoutDeleteModal = () => createAction(SPACE_LAYOUT_HIDE_DELETE_MODAL)
const showLayoutDeleteModal = () => createAction(SPACE_LAYOUT_SHOW_DELETE_MODAL)

const showSpaceAddDataModal = (dataType) => createAction(SPACE_SHOW_ADD_DATA_MODAL, dataType)
const hideSpaceAddDataModal = () => createAction(SPACE_HIDE_ADD_DATA_MODAL)

const toggleFilesAddDataCheckbox = (id) => createAction(SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX, id)
const toggleAllFilesAddDataCheckboxes = () => createAction(SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES)

const toggleAppsAddDataCheckbox = (id) => createAction(SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX, id)
const toggleAllAppsAddDataCheckboxes = () => createAction(SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES)

const toggleWorkflowsAddDataCheckbox = (id) => createAction(SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX, id)
const toggleAllWorkflowsAddDataCheckboxes = () => createAction(SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES)

export {
  fetchSpaces,
  switchListViewType,
  sortSpacesList,
  sortApps,
  sortJobs,
  sortWorkflows,
  searchSpacesList,
  resetSpacesListFilters,
  resetSpaceAppsFilters,
  resetSpaceJobsFilters,
  resetSpaceWorkflowsFilters,
  fetchSpace,
  fetchSpaceLockToggle,
  fetchWorkflows,
  fetchMembers,
  inviteMembers,
  createSpace,
  fetchNewSpaceInfo,
  fetchApps,
  fetchJobs,
  fetchFiles,
  sortFiles,
  resetSpaceFilesFilters,
  spaceSideMenuToggle,
  showAddMembersModal,
  hideAddMembersModal,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  toggleFileCheckbox,
  toggleAllFileCheckboxes,
  spacesSetPage,
  hideLayoutLockModal,
  showLayoutLockModal,
  hideLayoutUnlockModal,
  showLayoutUnlockModal,
  hideLayoutDeleteModal,
  showLayoutDeleteModal,
  lockSpace,
  unlockSpace,
  deleteSpace,
  showFilesActionModal,
  hideFilesActionModal,
  fetchFilesByAction,
  publishFiles,
  deleteFiles,
  showFilesRenameModal,
  hideFilesRenameModal,
  renameFile,
  showSpaceAddDataModal,
  hideSpaceAddDataModal,
  createFolder,
  showFilesCopyModal,
  hideFilesCopyModal,
  fetchAccessibleSpaces,
  selectAccessibleSpace,
  copyToSpace,
  copyToPrivate,
  fetchAccessibleFiles,
  fetchAccessibleApps,
  fetchAccessibleWorkflows,
  toggleFilesAddDataCheckbox,
  toggleAllFilesAddDataCheckboxes,
  toggleAppsAddDataCheckbox,
  toggleAllAppsAddDataCheckboxes,
  toggleWorkflowsAddDataCheckbox,
  toggleAllWorkflowsAddDataCheckboxes,
  addDataToSpace,
  editSpace,
  toggleAppCheckbox,
  toggleAllAppCheckboxes,
  toggleWorkflowCheckbox,
  toggleAllWorkflowCheckboxes,
  showAppsCopyModal,
  hideAppsCopyModal,
  showWorkflowsCopyModal,
  hideWorkflowsCopyModal,
}
