import { createAction } from '../../utils/redux'
import {
  fetchApps,
  fetchAppsFeatured,
  fetchAppsEverybody,
  fetchAppsSpaces,
  fetchAppDetails,
  assignToChallenge,
  comparisonAction,
  fetchAppExecutions,
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
  setAppFilterValue,
  resetAppsFiltersValue,
  setAppFeaturedFilterValue,
  resetAppsFeaturedFiltersValue,
  setAppEverybodyFilterValue,
  resetAppsEverybodyFiltersValue,
  setAppSpacesFilterValue,
  resetAppsSpacesFiltersValue,
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
  toggleAllAppsEverybodyCheckboxes,
  toggleAppEverybodyCheckbox,
  toggleAllAppsSpacesCheckboxes,
  toggleAppSpacesCheckbox,
  resetAppsModals,
  showCopyToSpaceModal,
  hideCopyToSpaceModal,
  showAppsAssignToChallengeModal,
  hideAppsAssignToChallengeModal,
  showAppEditTagsModal,
  hideAppEditTagsModal,
  showAppsAttachToModal,
  hideAppsAttachToModal,
  showAppsComparisonModal,
  hideAppsComparisonModal,
  showAppsDeleteModal,
  hideAppsDeleteModal,
  setAppExecutionsFilterValue,
  resetAppExecutionsFiltersValue,
} from './apps'
import {
  fetchDatabases,
  fetchDatabaseDetails,
  toggleAllDatabasesCheckboxes,
  toggleDatabaseCheckbox,
  setDatabaseFilterValue,
  resetDatabasesFiltersValue,
  setDatabaseSpacesFilterValue,
  resetDatabasesSpacesFiltersValue,
  toggleAllDatabasesSpacesCheckboxes,
  toggleDatabaseSpacesCheckbox,
  resetDatabasesModals,
  showDatabaseEditTagsModal,
  hideDatabaseEditTagsModal,
  showDatabasesEditInfoModal,
  hideDatabasesEditInfoModal,
  editDatabaseInfo,
  runDatabasesAction,
  createDatabase,
  // todo later:
  // fetchDatabasesSpaces,
  // showDatabasesCopyToSpaceModal,
  // hideDatabasesCopyToSpaceModal,
  // copyToSpaceDatabases,
} from './databases'
import fetchAccessibleSpaces from './fetchAccessibleSpaces'
import fetchAccessibleLicense from './fetchAccessibleLicense'
import copyToSpace from './copyToSpace'
import attachTo from './attachTo'
import fetchAttachingItems from './fetchAttachingItems'
import makePublic from './makePublic'
import deleteObjects from './deleteObjects'
import makeFeatured from './makeFeatured'
import attachLicense from './attachLicense'
import editTags from './editTags'
import licenseAction from './licenseAction'
import fetchCounters from './fetchCounters'
import {
  HOME_SET_CURRENT_TAB,
  HOME_SET_CURRENT_PAGE,
  HOME_SELECT_ACCESSIBLE_SPACE,
  HOME_SET_PAGE_COUNTERS,
  HOME_SET_INITIAL_PAGE_ADMIN_STATUS,
  HOME_SET_IS_LEFT_MENU_OPEN,
  HOME_SELECT_ACCESSIBLE_LICENSE,
} from './types'
import { OBJECT_TYPES, HOME_ASSETS_MODALS, HOME_FILES_MODALS } from '../../constants'
import {
  fetchFiles,
  fetchFilesFeatured,
  fetchFilesEverybody,
  fetchFilesSpaces,
  fetchFileDetails,
  renameFile,
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
  showFilesMakePublicFolderModal,
  hideFilesMakePublicFolderModal,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  showUploadModal,
  hideUploadModal,
  createFolder,
  showFilesDeleteModal,
  hideFilesDeleteModal,
  showFilesCopyToSpaceModal,
  hideFilesCopyToSpaceModal,
  showFilesAttachToModal,
  hideFilesAttachToModal,
  showFilesMoveModal,
  hideFilesMoveModal,
  showFilesAttachLicenseModal,
  hideFilesAttachLicenseModal,
  fetchFilesByAction,
  showFileEditTagsModal,
  hideFileEditTagsModal,
  filesMove,
  fetchSubfolders,
  showFilesLicenseModal,
  hideFilesLicenseModal,
  showFilesAcceptLicenseModal,
  hideFilesAcceptLicenseModal,
} from './files'
import {
  fetchWorkflows,
  fetchWorkflowsFeatured,
  fetchWorkflowsEveryone,
  fetchWorkflowsSpaces,
  toggleAllWorkflowsCheckboxes,
  toggleWorkflowCheckbox,
  setWorkflowFilterValue,
  resetWorkflowsFiltersValue,
  setWorkflowFeaturedFilterValue,
  resetWorkflowsFeaturedFiltersValue,
  setWorkflowEveryoneFilterValue,
  resetWorkflowsEveryoneFiltersValue,
  setWorkflowSpacesFilterValue,
  resetWorkflowsSpacesFiltersValue,
  toggleAllWorkflowsFeaturedCheckboxes,
  toggleWorkflowFeaturedCheckbox,
  toggleAllWorkflowsEveryoneCheckboxes,
  toggleWorkflowEveryoneCheckbox,
  toggleAllWorkflowsSpacesCheckboxes,
  toggleWorkflowSpacesCheckbox,
  resetWorkflowsModals,
  showWorkflowsRenameModal,
  hideWorkflowsCopyToSpaceModal,
  showWorkflowsCopyToSpaceModal,
  showWorkflowsMakePublicModal,
  hideWorkflowsMakePublicModal,
  showWorkflowsDeleteModal,
  hideWorkflowsDeleteModal,
  showWorkflowsAttachToModal,
  hideWorkflowsAttachToModal,
  fetchWorkflowDetails,
  fetchWorkflowDiagram,
  showWorkflowEditTagsModal,
  hideWorkflowEditTagsModal,
  fetchWorkflowExecutions,
  resetWorkflowExecutionsFiltersValue,
  setWorkflowExecutionsFilterValue,
} from './workflows'
import {
  fetchExecutions,
  fetchExecutionsSpaces,
  fetchExecutionDetails,
  fetchExecutionsEverybody,
  fetchExecutionsFeatured,
  syncFiles,
  terminateExecutions,
  expandExecution,
  expandAllExecutions,
  toggleExecutionCheckbox,
  toggleAllExecutionsCheckboxes,
  expandExecutionSpaces,
  expandAllExecutionsSpaces,
  toggleExecutionSpacesCheckbox,
  toggleAllExecutionsSpacesCheckboxes,
  setExecutionsFilterValue,
  resetExecutionsFiltersValue,
  setExecutionsSpacesFilterValue,
  resetExecutionsSpacesFiltersValue,
  showExecutionsCopyToSpaceModal,
  hideExecutionsCopyToSpaceModal,
  showExecutionsAttachToModal,
  hideExecutionsAttachToModal,
  showExecutionsTerminateModal,
  hideExecutionsTerminateModal,
  showExecutionsEditTagsModal,
  hideExecutionsEditTagsModal,
  expandExecutionEverybody,
  expandAllExecutionsEverybody,
  toggleExecutionEverybodyCheckbox,
  toggleAllExecutionsEverybodyCheckboxes,
  setExecutionsEverybodyFilterValue,
  resetExecutionsEverybodyFiltersValue,
  expandExecutionFeatured,
  expandAllExecutionsFeatured,
  toggleExecutionFeaturedCheckbox,
  toggleAllExecutionsFeaturedCheckboxes,
  setExecutionsFeaturedFilterValue,
  resetExecutionsFeaturedFiltersValue,
} from './executions'
import {
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
  showAssetsAcceptLicenseModal,
  hideAssetsAcceptLicenseModal,
} from './assets'


const copyToSpaceWorkflows = (scope, ids) => copyToSpace('/api/workflows/copy', OBJECT_TYPES.WORKFLOW, scope, ids)
const setCurrentTab = (tab) => createAction(HOME_SET_CURRENT_TAB, tab)
const setCurrentPage = (page) => createAction(HOME_SET_CURRENT_PAGE, page)
const setPageCounters = (counters, tab) => createAction(HOME_SET_PAGE_COUNTERS, { counters, tab })
const setInitialPageAdminStatus = (status) => createAction(HOME_SET_INITIAL_PAGE_ADMIN_STATUS, status)
const setIsLeftMenuOpen = (value) => createAction(HOME_SET_IS_LEFT_MENU_OPEN, value)

const copyToSpaceApps = (scope, ids) => copyToSpace('/api/apps/copy', OBJECT_TYPES.APP, scope, ids)
const appsAttachTo = (items, noteUids) => attachTo(OBJECT_TYPES.APP, items, noteUids)
const editAppTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.APP)
const editFileTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.FILE)

// const copyToSpaceDatabases = (scope, ids) => copyToSpace('/api/databases/copy', OBJECT_TYPES.DATABASE, scope, ids)
const databasesLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.DATABASE, HOME_FILES_MODALS.LICENSE)
const databasesAcceptLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.DATABASE, HOME_FILES_MODALS.ACCEPT_LICENSE)
const editDatabaseTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.DATABASE)

const makePublicFolder = (link, ids) => makePublic(link, OBJECT_TYPES.FILE, ids)
const copyToSpaceFiles = (scope, ids) => copyToSpace('/api/files/copy', OBJECT_TYPES.FILE, scope, ids)
const filesAttachTo = (items, noteUids) => attachTo(OBJECT_TYPES.FILE, items, noteUids)
const attachLicenseFiles = (scope, ids, link) => attachLicense(link, OBJECT_TYPES.FILE, scope, ids)
const selectAccessibleSpace = (scope) => createAction(HOME_SELECT_ACCESSIBLE_SPACE, scope)
const selectAccessibleLicense = (id) => createAction(HOME_SELECT_ACCESSIBLE_LICENSE, id)
const filesLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.FILE, HOME_FILES_MODALS.LICENSE)
const filesAcceptLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.FILE, HOME_FILES_MODALS.ACCEPT_LICENSE)

const copyToSpaceExecutions = (scope, ids) => copyToSpace('/api/jobs/copy', OBJECT_TYPES.JOB, scope, ids)
const executionsAttachTo = (items, noteUids) => attachTo(OBJECT_TYPES.JOB, items, noteUids)
const editExecutionTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.JOB)
const makePublicWorkflows = (ids) => makePublic('/api/workflows/copy', OBJECT_TYPES.WORKFLOW, ids)
const workflowsAttachTo = (items, noteUids) => attachTo(OBJECT_TYPES.WORKFLOW, items, noteUids)
const editWorkflowTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.WORKFLOW)

const assetsAttachTo = (items, noteUids) => attachTo(OBJECT_TYPES.ASSET, items, noteUids)
const editAssetTags = (uid, tags, suggestedTags) => editTags(uid, tags, suggestedTags, OBJECT_TYPES.ASSET)
const assetsAttachLicence = (link, scope, ids) => attachLicense(ids, OBJECT_TYPES.ASSET, link)
const assetsLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.ASSET)
const assetsAcceptLicenseAction = (link) => licenseAction(link, OBJECT_TYPES.ASSET, HOME_ASSETS_MODALS.ACCEPT_LICENSE)

export {
  setCurrentTab,
  setCurrentPage,
  setPageCounters,
  setIsLeftMenuOpen,
  fetchCounters,
  fetchApps,
  fetchAppsFeatured,
  fetchAppsEverybody,
  fetchAppsSpaces,
  fetchAppDetails,
  assignToChallenge,
  editAppTags,
  comparisonAction,
  fetchAttachingItems,
  deleteObjects,
  makeFeatured,
  fetchAppExecutions,
  toggleAllAppsCheckboxes,
  toggleAppCheckbox,
  setAppFilterValue,
  resetAppsFiltersValue,
  setAppFeaturedFilterValue,
  resetAppsFeaturedFiltersValue,
  setAppEverybodyFilterValue,
  resetAppsEverybodyFiltersValue,
  setAppSpacesFilterValue,
  resetAppsSpacesFiltersValue,
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
  toggleAllAppsEverybodyCheckboxes,
  toggleAppEverybodyCheckbox,
  toggleAllAppsSpacesCheckboxes,
  toggleAppSpacesCheckbox,
  fetchAccessibleSpaces,
  selectAccessibleSpace,
  copyToSpaceApps,
  appsAttachTo,
  resetAppsModals,
  showCopyToSpaceModal,
  hideCopyToSpaceModal,
  showAppsAssignToChallengeModal,
  hideAppsAssignToChallengeModal,
  showAppEditTagsModal,
  hideAppEditTagsModal,
  showAppsAttachToModal,
  hideAppsAttachToModal,
  showAppsComparisonModal,
  hideAppsComparisonModal,
  setInitialPageAdminStatus,
  showAppsDeleteModal,
  hideAppsDeleteModal,
  showFilesDeleteModal,
  hideFilesDeleteModal,
  selectAccessibleLicense,
  setAppExecutionsFilterValue,
  resetAppExecutionsFiltersValue,
}
export {
  fetchDatabases,
  fetchDatabaseDetails,

  toggleAllDatabasesCheckboxes,
  toggleDatabaseCheckbox,

  setDatabaseFilterValue,
  resetDatabasesFiltersValue,

  setDatabaseSpacesFilterValue,
  resetDatabasesSpacesFiltersValue,

  toggleAllDatabasesSpacesCheckboxes,
  toggleDatabaseSpacesCheckbox,

  databasesLicenseAction,
  databasesAcceptLicenseAction,

  // fetchDatabasesSpaces,
  // showDatabasesCopyToSpaceModal,
  // hideDatabasesCopyToSpaceModal,
  // copyToSpaceDatabases,

  resetDatabasesModals,

  showDatabaseEditTagsModal,
  hideDatabaseEditTagsModal,
  editDatabaseTags,

  showDatabasesEditInfoModal,
  hideDatabasesEditInfoModal,
  editDatabaseInfo,
  runDatabasesAction,
  createDatabase,
}

export {
  fetchFiles,
  fetchFilesFeatured,
  toggleAllFilesCheckboxes,
  toggleFileCheckbox,
  toggleAllFilesFeaturedCheckboxes,
  toggleFileFeaturedCheckbox,
  fetchFilesEverybody,
  fetchFilesSpaces,
  fetchFileDetails,
  renameFile,
  setFileFilterValue,
  resetFilesFiltersValue,
  setFileFeaturedFilterValue,
  resetFilesFeaturedFiltersValue,
  setFileEverybodyFilterValue,
  resetFilesEverybodyFiltersValue,
  setFileSpacesFilterValue,
  resetFilesSpacesFiltersValue,
  toggleAllFilesEverybodyCheckboxes,
  toggleFileEverybodyCheckbox,
  toggleAllFilesSpacesCheckboxes,
  toggleFileSpacesCheckbox,
  resetFilesModals,
  showFilesRenameModal,
  hideFilesRenameModal,
  showFilesMakePublicFolderModal,
  hideFilesMakePublicFolderModal,
  makePublicFolder,
  copyToSpaceFiles,
  showFilesAddFolderModal,
  hideFilesAddFolderModal,
  showUploadModal,
  hideUploadModal,
  createFolder,
  showFilesCopyToSpaceModal,
  hideFilesCopyToSpaceModal,
  showFilesAttachToModal,
  hideFilesAttachToModal,
  filesAttachTo,
  showFilesMoveModal,
  hideFilesMoveModal,
  showFilesAttachLicenseModal,
  hideFilesAttachLicenseModal,
  attachLicenseFiles,
  fetchAccessibleLicense,
  fetchFilesByAction,
  showFileEditTagsModal,
  hideFileEditTagsModal,
  editFileTags,
  filesMove,
  fetchSubfolders,
  showFilesLicenseModal,
  hideFilesLicenseModal,
  filesLicenseAction,
  showFilesAcceptLicenseModal,
  hideFilesAcceptLicenseModal,
  filesAcceptLicenseAction,
}

export {
  fetchWorkflows,
  fetchWorkflowsFeatured,
  fetchWorkflowsSpaces,
  fetchWorkflowsEveryone,
  resetWorkflowsFiltersValue,
  resetWorkflowsFeaturedFiltersValue,
  resetWorkflowsSpacesFiltersValue,
  resetWorkflowsEveryoneFiltersValue,
  resetWorkflowsModals,
  toggleAllWorkflowsCheckboxes,
  toggleWorkflowCheckbox,
  hideWorkflowsCopyToSpaceModal,
  showWorkflowsCopyToSpaceModal,
  showWorkflowsRenameModal,
  copyToSpaceWorkflows,
  showWorkflowsMakePublicModal,
  hideWorkflowsMakePublicModal,
  setWorkflowFilterValue,
  setWorkflowFeaturedFilterValue,
  setWorkflowSpacesFilterValue,
  setWorkflowEveryoneFilterValue,
  toggleAllWorkflowsFeaturedCheckboxes,
  toggleWorkflowFeaturedCheckbox,
  toggleAllWorkflowsEveryoneCheckboxes,
  toggleWorkflowEveryoneCheckbox,
  toggleAllWorkflowsSpacesCheckboxes,
  toggleWorkflowSpacesCheckbox,
  makePublicWorkflows,
  showWorkflowsDeleteModal,
  hideWorkflowsDeleteModal,
  showWorkflowsAttachToModal,
  hideWorkflowsAttachToModal,
  workflowsAttachTo,
  showWorkflowEditTagsModal,
  hideWorkflowEditTagsModal,
  editWorkflowTags,
  fetchWorkflowExecutions,
  resetWorkflowExecutionsFiltersValue,
  setWorkflowExecutionsFilterValue,
}

export {
  fetchExecutions,
  fetchExecutionsSpaces,
  fetchExecutionDetails,
  fetchExecutionsEverybody,
  fetchExecutionsFeatured,
  syncFiles,
  terminateExecutions,
  expandExecution,
  expandAllExecutions,
  toggleExecutionCheckbox,
  toggleAllExecutionsCheckboxes,
  expandExecutionSpaces,
  expandAllExecutionsSpaces,
  toggleExecutionSpacesCheckbox,
  toggleAllExecutionsSpacesCheckboxes,
  setExecutionsFilterValue,
  resetExecutionsFiltersValue,
  setExecutionsSpacesFilterValue,
  resetExecutionsSpacesFiltersValue,
  showExecutionsCopyToSpaceModal,
  hideExecutionsCopyToSpaceModal,
  showExecutionsAttachToModal,
  hideExecutionsAttachToModal,
  copyToSpaceExecutions,
  executionsAttachTo,
  showExecutionsTerminateModal,
  hideExecutionsTerminateModal,
  editExecutionTags,
  showExecutionsEditTagsModal,
  hideExecutionsEditTagsModal,
  expandExecutionEverybody,
  expandAllExecutionsEverybody,
  toggleExecutionEverybodyCheckbox,
  toggleAllExecutionsEverybodyCheckboxes,
  setExecutionsEverybodyFilterValue,
  resetExecutionsEverybodyFiltersValue,
  expandExecutionFeatured,
  expandAllExecutionsFeatured,
  toggleExecutionFeaturedCheckbox,
  toggleAllExecutionsFeaturedCheckboxes,
  setExecutionsFeaturedFilterValue,
  resetExecutionsFeaturedFiltersValue,
  fetchWorkflowDetails,
  fetchWorkflowDiagram,
}

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
  assetsAttachTo,
  editAssetTags,
  assetsAttachLicence,
  assetsLicenseAction,
  showAssetsLicenseModal,
  hideAssetsLicenseModal,
  showAssetsAcceptLicenseModal,
  hideAssetsAcceptLicenseModal,
  assetsAcceptLicenseAction,
}
