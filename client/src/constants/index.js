export const SPACE_TYPE_CARD = 'card'
export const SPACE_TYPE_TABLE = 'table'
export const SPACE_VIEW_TYPES = [SPACE_TYPE_CARD, SPACE_TYPE_TABLE]

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
export const SPACE_PRIVATE = 'private'
export const SPACE_PRIVATE_TYPE = 'private_type'
export const SPACE_GOVERNMENT = 'government'
export const SPACE_ADMINISTRATOR = 'administrator'

export const SPACE_TYPES = {
  PRIVATE_TYPE: 'private_type',
  GOVERNMENT_GROUP: 'government',
  ADMIN_GROUP: 'administrator',
}

export const SPACE_STATUS_UNACTIVATED = 'unactivated'
export const SPACE_STATUS_ACTIVE = 'active'
export const SPACE_STATUS_LOCKED = 'locked'

export const SPACE_FILES_ACTIONS = {
  DELETE: 'delete',
  PUBLISH: 'publish',
  DOWNLOAD: 'download',
  OPEN: 'open',
  COPY: 'copy',
  COPY_TO_PRIVATE: 'copy_to_private',
}

export const SPACE_ADD_DATA_TYPES = {
  FILES: 'FILES',
  APPS: 'APPS',
  DATABASES: 'DATABASES',
  WORKFLOWS: 'WORKFLOWS',
  JOBS: 'JOBS',
}

export const OBJECT_TYPES = {
  FILE: 'FILE',
  APP: 'APP',
  DATABASE: 'DATABASE',
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
  CREATE: 'CREATE',
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
  DATABASES: 'DATABASES',
  ASSETS: 'ASSETS',
  WORKFLOWS: 'WORKFLOWS',
  JOBS: 'JOBS',
  NOTES: 'NOTES',
}

export const HOME_DATABASE_TYPES = {
  PRIVATE: 'privateDatabases',
  SPACES: 'spacesDatabases',
}

export const HOME_DATABASE_PASSWORD = {
  MIN_LENGTH: 8,
}

export const HOME_DATABASE_ENGINE_TYPES = {
  MySQL: 'aurora-mysql',
  PostgreSQL: 'aurora-postgresql',
}

export const HOME_DATABASE_MYSQL_INSTANCE_VERSIONS = {
  V_5_7_12: '5.7.12',
}

export const HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS = {
  V_9_6_16: '9.6.16',
  V_9_6_17: '9.6.17',
  V_9_6_18: '9.6.18',
  V_9_6_19: '9.6.19',
  V_10_14: '10.14',
}

export const HOME_DATABASE_INSTANCE_CLASSES = [
  'db_std1_x2',
  'db_mem1_x2',
  'db_mem1_x4',
  'db_mem1_x8',
  'db_mem1_x16',
  'db_mem1_x32',
  'db_mem1_x48',
  'db_mem1_x64',
]

export const HOME_DATABASE_INSTANCES = {
  DB_STD1_X2: 'db_std1_x2',
  DB_MEM1_X2: 'db_mem1_x2',
  DB_MEM1_X4: 'db_mem1_x4',
  DB_MEM1_X8: 'db_mem1_x8',
  DB_MEM1_X16: 'db_mem1_x16',
  DB_MEM1_X32: 'db_mem1_x32',
  DB_MEM1_X48: 'db_mem1_x48',
  DB_MEM1_X64: 'db_mem1_x64',
}

export const HOME_DATABASE_LABELS = {
  db_std1_x2: 'DB Baseline 1 x 2',
  db_mem1_x2: 'DB Mem 1 x 2',
  db_mem1_x4: 'DB Mem 1 x 4',
  db_mem1_x8: 'DB Mem 1 x 8',
  db_mem1_x16: 'DB Mem 1 x 16',
  db_mem1_x32: 'DB Mem 1 x 32',
  db_mem1_x48: 'DB Mem 1 x 48',
  db_mem1_x64: 'DB Mem 1 x 64',
  'aurora-mysql': 'MySQL',
  'aurora-postgresql': 'PostgreSQL',
  available: 'Available',
  creating: 'Creating',
  starting: 'Starting',
  stopped: 'Stopped',
  stopping: 'Stopping',
  terminated: 'Terminated',
  terminating: 'Terminating',
}

export const HOME_DATABASES_MODALS = {
  EDIT_TAGS: 'editTagsModal',
  ATTACH_LICENSE: 'attachLicenseModal',
  LICENSE: 'licenseModal',
  ACCEPT_LICENSE: 'acceptLicenseModal',
  EDIT: 'editDatabaseInfoModal',
  RUN_ACTION: 'runActionModal',
  // COPY_TO_SPACE: 'copyToSpaceModal',
  // MOVE_TO_ARCHIVE: 'moveToArchiveModal',
}

export const HOME_DATABASES_ACTIONS = {
  START: 'start',
  STOP: 'stop',
  TERMINATE: 'terminate',
  CREATE: 'create',
  EDIT: 'edit',
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
  FOLDERS: 'folders',
}

export const HOME_FILES_MODALS = {
  RENAME: 'renameModal',
  COPY_TO_SPACE: 'copyToSpaceModal',
  MAKE_PUBLIC_FOLDER: 'makePublicFolderModal',
  ADD_FOLDER: 'addFolderModal',
  DELETE: 'deleteModal',
  ATTACH_TO: 'filesAttachToModal',
  MOVE: 'moveModal',
  ATTACH_LICENSE: 'attachLicenseModal',
  EDIT_TAGS: 'editTagsModal',
  LICENSE: 'licenseModal',
  ACCEPT_LICENSE: 'acceptLicenseModal',
}

export const HOME_FILES_ACTIONS = {
  MAKE_PUBLIC: 'make_public',
  EXPORT: 'export',
  DELETE: 'delete',
  DOWNLOAD: 'download',
  OPEN: 'open',
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
  SYNC_FILES: 'syncFiles',
}

export const HOME_ASSETS_MODALS = {
  EDIT_TAGS: 'editTagsModal',
  ATTACH_TO: 'attachToModal',
  RENAME: 'renameModal',
  DELETE: 'deleteModal',
  DOWNLOAD: 'downloadModal',
  OPEN: 'openModal',
  ATTACH_LICENSE: 'attachLicenseModal',
  LICENSE: 'licenseModal',
  ACCEPT_LICENSE: 'acceptLicenseModal',
}

export const CHALLENGE_STATUS = {
  SETUP: 'setup',
  PRE_REGISTRATION: 'pre-registration',
  OPEN: 'open',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
  RESULT_ANNOUNCED: 'result_announced',
}

export const CHALLENGE_TIME_STATUS = {
  UPCOMING: 'upcoming',
  CURRENT: 'current',
  ENDED: 'ended',
}

export const EXPERT_STATE = {
  OPEN: 'open',
  CLOSED: 'closed',
}

export const EXPERTS_MODALS = {
  ASK_QUESTION: 'askQuestionModal',
  EDIT: 'editExpertInfoModal',
}


export const PFDA_EMAIL = 'precisionfda@fda.hhs.gov'
export const SUPPORT_EMAIL = 'precisionfda-support@dnanexus.com'
export const MAILING_LIST =
  'https://public.govdelivery.com/accounts/USFDA/subscriber/new?topic_id=USFDA_564'
