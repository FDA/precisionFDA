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
