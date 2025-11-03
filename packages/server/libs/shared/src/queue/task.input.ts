import { NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import type { EmailSendInput } from '../domain/email/email.config'
import type { UserCtx } from '../types'

export type Task = {
  type: TASK_TYPE
}

export type TaskWithAuth = Task & {
  user: UserCtx
  // payload type is more strictly defined below depending on task
  payload?: unknown
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
  SYNC_DBCLUSTER_JOB_OUTPUT = 'sync_dbcluster_job_output',
  SYNC_SPACES_PERMISSIONS = 'sync_spaces_permissions',
  USER_CHECKUP = 'user_checkup',
  DEBUG_MAX_MEMORY = 'debug_test_max_memory',
  REMOVE_NODES = 'remove_nodes',
  // TODO - Standardize on DOMAIN_ACTION naming scheme
  WORKSTATION_SNAPSHOT = 'workstation_snapshot',
  LOCK_NODES = 'lock_nodes',
  UNLOCK_NODES = 'unlock_nodes',
  ADMIN_DATA_CONSISTENCY_REPORT = 'admin_data_consistency_report',
  USER_INACTIVITY_ALERT = 'user_inactivity_alert',
  USER_DATA_CONSISTENCY_REPORT = 'user_data_consistency_report',
  GENERATE_SPACE_REPORT_BATCH = 'generate_space_report_batch',
  GENERATE_SPACE_REPORT_RESULT = 'generate_space_report_result',
  NOTIFY_NEW_DISCUSSION = 'notify_new_discussion',
  NOTIFY_NEW_DISCUSSION_REPLY = 'notify_new_discussion_reply',
  PROVISION_NEW_USERS = 'provision_new_users',
}

// will be used in the sub-handler
export type BasicUserJob = TaskWithAuth & {
  type: TASK_TYPE.USER_CHECKUP | TASK_TYPE.CHECK_USER_JOBS
}

export type CheckStatusJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_JOB_STATUS | TASK_TYPE.SYNC_JOB_OUTPUTS
  payload: {
    dxid: DxId<'job'>
    id?: number
    name?: string
    uid?: Uid<'job'>
    email?: string
  }
}

export type SendEmailJob = TaskWithMaybeAuth & {
  type: TASK_TYPE.SEND_EMAIL
  payload: EmailSendInput
}

export type SyncDbClusterJob = TaskWithAuth & {
  type: TASK_TYPE.SYNC_DBCLUSTER_STATUS
  payload: { dxid: DxId<'dbcluster'> }
}

export type SyncDbClusterJobOutput = TaskWithAuth & {
  type: TASK_TYPE.SYNC_DBCLUSTER_JOB_OUTPUT
  payload: {
    jobDxid: DxId<'job'>
    dbClusterUid: Uid<'dbcluster'>
  }
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

export type NotifyNewDiscussionJob = TaskWithAuth & {
  type: TASK_TYPE.NOTIFY_NEW_DISCUSSION
  payload: {
    discussionId: number
    notify: NotifyType
  }
}

export type ProvisionNewUserJob = TaskWithAuth & {
  type: TASK_TYPE.PROVISION_NEW_USERS
  payload: {
    ids: number[]
    spaceIds: number[]
  }
}
