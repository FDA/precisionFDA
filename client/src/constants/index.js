export const SPACE_TYPE_CARD = 'card'
export const SPACE_TYPE_TABLE = 'table'
export const SPACE_VIEW_TYPES = [
  SPACE_TYPE_CARD,
  SPACE_TYPE_TABLE,
]

export const SORT_ASC = 'ASC'
export const SORT_DESC = 'DESC'

export const ALERT_ABOVE_ALL = 'ALERT_ABOVE_ALL'
export const ALERT_TYPES = [ALERT_ABOVE_ALL]
export const ALERT_STYLES = ['success', 'danger', 'warning', 'info']

export const FILES_TYPE_FOLDER = 'Folder'
export const FILES_TYPE_FILE = 'UserFile'

export const SPACE_REVIEW = 'review'
export const SPACE_GROUPS = 'groups'
export const SPACE_VERIFICATION = 'verification'

export const SPACE_STATUS_UNACTIVATED = 'unactivated'
export const SPACE_STATUS_ACTIVE = 'active'
export const SPACE_STATUS_LOCKED = 'locked'

export const SPACE_FILES_ACTIONS = {
  DELETE: 'delete',
  PUBLISH: 'publish',
  DOWNLOAD: 'download',
  COPY: 'copy',
  COPY_TO_PRIVATE: 'copy_to_private',
}

export const SPACE_ADD_DATA_TYPES = {
  FILES: 'FILES',
  APPS: 'APPS',
  WORKFLOWS: 'WORKFLOWS',
  JOBS: 'JOBS',
}

export const OBJECT_TYPES = {
  FILE: 'FILE',
  APP: 'APP',
  WORKFLOW: 'WORKFLOW',
  JOB: 'JOB',
  ASSET: 'ASSET',
}

export const SPACE_MEMBERS_ROLES = [
  { value: 'admin', label: 'admin' },
  { value: 'contributor', label: 'contributor' },
  { value: 'viewer', label: 'viewer' },
]

export const NEW_SPACE_PAGE_ACTIONS = {
  DUPLICATE: 'DUPLICATE',
  EDIT: 'EDIT',
}

export const ERROR_PAGES = {
  NOT_FOUND: 'NOT_FOUND',
  LOCKED_SPACE: 'LOCKED_SPACE',
}

export const STATE_REMOVING = 'removing'
export const STATE_COPYING = 'copying'

export const HOME_TABS = {
  PRIVATE: 'PRIVATE',
  FEATURED: 'FEATURED',
  EVERYBODY: 'EVERYBODY',
  SPACES: 'SPACES',
}

export const HOME_PAGES = {
  FILES: 'FILES',
  APPS: 'APPS',
  ASSETS: 'ASSETS',
  WORKFLOWS: 'WORKFLOWS',
  JOBS: 'JOBS',
  NOTES: 'NOTES',
}

export const HOME_APP_TYPES = {
  PRIVATE: 'privateApps',
  FEATURED: 'featuredApps',
  EVERYBODY: 'everybodyApps',
  SPACES: 'spacesApps',
}

export const HOME_APPS_MODALS = {
  COPY_TO_SPACE: 'copyToSpaceModal',
  ASSIGN_TO_CHALLENGE: 'assignToChallengeModal',
  EDIT_TAGS: 'editTagsModal',
  ATTACH_TO: 'appsAttachToModal',
  COMPARISON: 'comparisonModal',
  DELETE: 'deleteModal',
}

export const HOME_APPS_ACTIONS = {
  MAKE_PUBLIC: 'make_public',
}

export const HOME_FILE_TYPES = {
  PRIVATE: 'privateFiles',
  FEATURED: 'featuredFiles',
  EVERYBODY: 'everybodyFiles',
  SPACES: 'spacesFiles',
}

export const HOME_FILES_MODALS = {
  RENAME: 'renameModal',
  COPY_TO_SPACE: 'copyToSpaceModal',
  MAKE_PUBLIC: 'makePublicModal',
  ADD_FOLDER: 'addFolderModal',
  DELETE: 'deleteModal',
  ATTACH_TO: 'filesAttachToModal',
  MOVE: 'moveModal',
  ATTACH_LICENSE: 'attachLicenseModal',
  EDIT_TAGS: 'editTagsModal',
  LICENSE: 'licenseModal',
}

export const HOME_FILES_ACTIONS = {
  MAKE_PUBLIC: 'make_public',
  EXPORT: 'export',
  DELETE: 'delete',
  DOWNLOAD: 'download',
}

// WORKFLOWS
export const HOME_WORKFLOW_TYPES = {
  PRIVATE: 'privateWorkflows',
  FEATURED: 'featuredWorkflows',
  EVERYONE: 'everyoneWorkflows',
  SPACES: 'spacesWorkflows',
}

export const HOME_WORKFLOWS_ACTIONS = {
  MAKE_PUBLIC: 'makePublic',
  DELETE: 'delete',
  COPY_TO_SPACE: 'copyToSpace',
  ATTACH_TO: 'attachTo',
  FEATURE: 'feature',
  UNFEATURE: 'unfeature',
}

export const HOME_WORKFLOW_ACTIONS = {
  RUN: 'run',
  RUN_BATCH: 'runBatch',
  FORK: 'fork',
  EXPORT_TO: 'exportTo',
  COPY_TO_SPACE: 'copyToSpace',
  ATTACH_TO: 'attachTo',
}

export const HOME_WORKFLOWS_MODALS = {
  MAKE_PUBLIC: 'makePublicModal',
  COPY_TO_SPACE: 'copyToSpaceModal',
  DELETE: 'deleteModal',
  RUN_WORKFLOW: 'runWorkflowModal',
  RUN_BATCH_WORKFLOWS: 'runBatchWorkflowModal',
  ATTACH_TO: 'attachToModal',
  EDIT_TAGS: 'editTagsModal',
}

export const HOME_ENTRIES_TYPES = {
  PRIVATE: 'PRIVATE',
  FEATURED: 'FEATURED',
  EVERYBODY: 'EVERYBODY',
  SPACES: 'SPACES',
}

export const HOME_EXECUTIONS_MODALS = {
  COPY_TO_SPACE: 'copyToSpaceModal',
  EDIT_TAGS: 'editTagsModal',
  ATTACH_TO: 'attachToModal',
  TERMINATE: 'terminateModal',
}

export const HOME_ASSETS_MODALS = {
  EDIT_TAGS: 'editTagsModal',
  ATTACH_TO: 'attachToModal',
  RENAME: 'renameModal',
  DELETE: 'deleteModal',
  DOWNLOAD: 'downloadModal',
  ATTACH_LICENSE: 'attachLicenseModal',
  LICENSE: 'licenseModal',
}
