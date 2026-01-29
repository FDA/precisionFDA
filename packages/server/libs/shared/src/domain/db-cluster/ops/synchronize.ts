import { TASK_TYPE } from '@shared/queue/task.input'

export class SyncDbClusterOperation {
  static getBullJobId(dbClusterDxId: string): string {
    return `${TASK_TYPE.SYNC_DBCLUSTER_STATUS}.${dbClusterDxId}`
  }
}
