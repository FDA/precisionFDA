import type { EmailSendInput } from '../domain/email/email.config'
import type { UserCtx } from '../types'

export type Task = {
  type: TASK_TYPE
}

export type TaskWithAuth = Task & {
  user: UserCtx
  // payload type is more strictly defined below depending on task
  payload?: any
}

type TaskWithMaybeAuth = Task & {
  user: UserCtx | undefined
}

export enum TASK_TYPE {
  SYNC_FILES_STATE = 'sync_files_state',
  SYNC_FILE_STATE = 'sync_file_state',
  SYNC_JOB_STATUS = 'sync_job_status',
  SYNC_JOB_OUTPUTS = 'sync_job_outputs',
  SEND_EMAIL = 'send_email',
  CLOSE_FILE = 'close_file',
  CHECK_CHALLENGE_JOBS = 'check_challenge_jobs',
  CHECK_STALE_JOBS = 'check_stale_jobs',
  CHECK_USER_JOBS = 'check_user_jobs',
  FOLLOW_UP_ACTION = 'follow_up_action',
  CHECK_NON_TERMINATED_DBCLUSTERS = 'check_non_terminated_dbclusters',
  SYNC_DBCLUSTER_STATUS = 'sync_dbcluster_status',
  SYNC_SPACES_PERMISSIONS = 'sync_spaces_permissions',
  USER_CHECKUP = 'user_checkup',
  DEBUG_MAX_MEMORY = 'debug_test_max_memory',
  REMOVE_NODES = 'remove_nodes',
  OTHER_TASK = 'other',
  // TODO - Standardize on DOMAIN_ACTION naming scheme
  WORKSTATION_SNAPSHOT = 'workstation_snapshot',
  LOCK_NODES = 'lock_nodes',
  UNLOCK_NODES = 'unlock_nodes',
  ADMIN_DATA_CONSISTENCY_REPORT = 'admin_data_consistency_report',
  USER_INACTIVITY_ALERT = 'user_inactivity_alert',
  USER_DATA_CONSISTENCY_REPORT = 'user_data_consistency_report',
  GENERATE_SPACE_REPORT_BATCH = 'generate_space_report_batch',
  GENERATE_SPACE_REPORT_RESULT = 'generate_space_report_result',
}

// will be used in the sub-handler
export type BasicUserJob = TaskWithAuth & {
  type: TASK_TYPE.USER_CHECKUP | TASK_TYPE.CHECK_USER_JOBS
}

export type CheckStatusJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_JOB_STATUS | TASK_TYPE.SYNC_JOB_OUTPUTS
  payload: { dxid: string }
}

export type SendEmailJob = TaskWithMaybeAuth & {
  type: TASK_TYPE.SEND_EMAIL
  payload: EmailSendInput
}

export type CheckStaleJobsJob = TaskWithAuth & {
  payload: undefined
  type: TASK_TYPE.CHECK_STALE_JOBS
}

export type SyncDbClusterJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_DBCLUSTER_STATUS
  payload: { dxid: string }
}

// NOTE(samuel) - task running without user context
export type CheckNonTerminatedDbClustersJob = Task & {
  type: TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS
}

export type SyncSpacesPermissionsJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_SPACES_PERMISSIONS
}

export type GenerateSpaceReportBatchJob = TaskWithAuth & {
  type: TASK_TYPE.GENERATE_SPACE_REPORT_BATCH
  payload: number[]
}

export type GenerateSpaceReportResultJob = TaskWithAuth & {
  type: TASK_TYPE.GENERATE_SPACE_REPORT_RESULT
  payload: number
}
// ---------------------
// Admin and Debug tasks
// ---------------------

export type AdminDataConsistencyReportTask = Task & {
  type: TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT
}
