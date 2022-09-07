import { EmailSendInput } from '../domain/email/email.config'
import { UserCtx } from '../types'

type TaskWithAuth = {
  user: UserCtx
}

type TaskWithMaybeAuth = {
  user: UserCtx | undefined
}


export enum TASK_TYPE {
  SYNC_JOB_STATUS = 'sync_job_status',
  SYNC_WORKSTATION_FILES = 'sync_workstation_files',
  SEND_EMAIL = 'send_email',
  CHECK_STALE_JOBS = 'check_stale_jobs',
  CHECK_USER_JOBS = 'check_user_jobs',
  CHECK_NON_TERMINATED_DBCLUSTERS = 'check_non_terminated_dbclusters',
  SYNC_DBCLUSTER_STATUS = 'sync_dbcluster_status',
  SYNC_SPACES_PERMISSIONS = 'sync_spaces_permissions',
  USER_CHECKUP = 'user_checkup',
  DEBUG_MAX_MEMORY = 'debug_test_max_memory',
}

// will be used in the sub-handler
export type BasicUserJob = TaskWithAuth & {
  type: (TASK_TYPE.USER_CHECKUP | TASK_TYPE.CHECK_USER_JOBS)
}
export type CheckStatusJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_JOB_STATUS
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
export type SyncWorkstationFiles = TaskWithAuth & {
  type: TASK_TYPE.SYNC_WORKSTATION_FILES
}
// NOTE(samuel) - task running without user context
export type CheckNonTerminatedDbClustersJob = {
  type: TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS
}
export type SyncSpacesPermissionsJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_SPACES_PERMISSIONS
}

export type DebugMaxMemory = {
  type: TASK_TYPE.DEBUG_MAX_MEMORY
};

export type Task =
  | BasicUserJob
  | CheckStatusJob
  | SendEmailJob
  | CheckStaleJobsJob
  | CheckNonTerminatedDbClustersJob
  | SyncDbClusterJob
  | SyncSpacesPermissionsJob
  | SyncWorkstationFiles
  | DebugMaxMemory
