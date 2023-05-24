import { EmailSendInput } from '../domain/email/email.config'
import { WorkstationSnapshotOperationParams } from '../domain/job/ops/workstation-snapshot'
import { UserCtx } from '../types'

export type TaskWithAuth = {
  user: UserCtx
  // payload type is more strictly defined below depending on task
  payload?: any
}

type TaskWithMaybeAuth = {
  user: UserCtx | undefined
}


export enum TASK_TYPE {
  SYNC_FILES_STATE = 'sync_files_state',
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
  REMOVE_NODES = 'remove_nodes',
  OTHER_TASK = 'other',
  // TODO - Standardize on DOMAIN_ACTION naming scheme
  WORKSTATION_SNAPSHOT = 'workstation_snapshot'
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

export type RemoveNodesJob = TaskWithAuth & {
  type: TASK_TYPE.REMOVE_NODES
  payload: number[]
}

export type CheckStaleJobsJob = TaskWithAuth & {
  payload: undefined
  type: TASK_TYPE.CHECK_STALE_JOBS
}

export type SyncDbClusterJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_DBCLUSTER_STATUS
  payload: { dxid: string }
}

export type SyncFileStatesJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_FILES_STATE
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

// TODO - Consider renaming *Jobs to *Task, because Job already conflates with platform job and bull job
export type WorkstationSnapshotTask = TaskWithAuth & {
  type: TASK_TYPE.WORKSTATION_SNAPSHOT
  payload: WorkstationSnapshotOperationParams
}


export type Task =
  | BasicUserJob
  | CheckStatusJob
  | SendEmailJob
  | CheckStaleJobsJob
  | CheckNonTerminatedDbClustersJob
  | SyncDbClusterJob
  | SyncFileStatesJob
  | SyncSpacesPermissionsJob
  | SyncWorkstationFiles
  | DebugMaxMemory
  | RemoveNodesJob
  | WorkstationSnapshotTask
