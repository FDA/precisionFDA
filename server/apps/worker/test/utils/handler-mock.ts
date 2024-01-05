import { database, queue } from '@shared'
import { Job } from 'bull'
import { EmailQueueProcessor } from '../../src/domain/email/processor/email-queue.processor'
import { FileSyncQueueProcessor } from '../../src/domain/user-file/processor/file-sync-queue.processor'
import { MainQueueProcessor } from '../../src/queues/processor/main-queue.processor'
import { MaintenanceQueueProcessor } from '../../src/queues/processor/maintenance-queue.processor'

const processor = {
  MAIN: () => new MainQueueProcessor(),
  MAINTENANCE: () => new MaintenanceQueueProcessor(database.orm().em.fork()),
  FILE: () => new FileSyncQueueProcessor(database.orm().em.fork()),
  EMAIL: () => new EmailQueueProcessor(),
}

const jobToProcessorMap: Partial<
  Record<queue.types.TASK_TYPE, (job: Job) => Promise<void> | void>
> = {
  [queue.types.TASK_TYPE.SYNC_FILES_STATE]: (job) => processor.MAIN().syncFileState(job),
  [queue.types.TASK_TYPE.CHECK_CHALLENGE_JOBS]: (job) =>
    processor.MAINTENANCE().checkChallengeJobs(job),
  [queue.types.TASK_TYPE.SYNC_JOB_OUTPUTS]: (job) => processor.FILE().syncJobOutputs(job),
  [queue.types.TASK_TYPE.SYNC_JOB_STATUS]: (job) => processor.MAIN().syncJobStatus(job),
  [queue.types.TASK_TYPE.SYNC_WORKSTATION_FILES]: (job) =>
    processor.FILE().syncWorkstationFiles(job),
  [queue.types.TASK_TYPE.WORKSTATION_SNAPSHOT]: (job) =>
    processor.FILE().createWorkstationSnapshot(job),
  [queue.types.TASK_TYPE.SEND_EMAIL]: (job) => processor.EMAIL().sendEmail(job),
  [queue.types.TASK_TYPE.CHECK_STALE_JOBS]: (job) => processor.MAINTENANCE().checkStaleJobs(job),
  [queue.types.TASK_TYPE.REMOVE_NODES]: (job) => processor.FILE().removeNodes(job),
  [queue.types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS]: (job) =>
    processor.MAINTENANCE().checkNonTerminatedDbClusters(job),
  [queue.types.TASK_TYPE.SYNC_DBCLUSTER_STATUS]: (job) => processor.MAIN().syncDbClusterStatus(job),
  [queue.types.TASK_TYPE.SYNC_SPACES_PERMISSIONS]: (job) =>
    processor.MAINTENANCE().syncSpacesPermissions(job),
  [queue.types.TASK_TYPE.USER_CHECKUP]: (job) => processor.MAINTENANCE().userCheckup(job),
  [queue.types.TASK_TYPE.USER_DATA_CONSISTENCY_REPORT]: (job) =>
    processor.FILE().reportUserDataConsistency(job),
  [queue.types.TASK_TYPE.CHECK_USER_JOBS]: (job) => processor.MAINTENANCE().checkUserJobs(job),
  [queue.types.TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT]: (job) =>
    processor.MAINTENANCE().reportAdminDataConsistency(job),
  [queue.types.TASK_TYPE.DEBUG_MAX_MEMORY]: () => processor.MAINTENANCE().debugMaxMemory(),
  [queue.types.TASK_TYPE.LOCK_NODES]: (job) => processor.FILE().lockNodes(job),
  [queue.types.TASK_TYPE.UNLOCK_NODES]: (job) => processor.FILE().unlockNodes(job),
}

// TODO(PFDA-4831) - remove and replace usages by actual job creation in redis
export const mockHandler = async (job: Job<queue.types.Task>) => {
  const processor = jobToProcessorMap[job.data.type]

  if (!processor) {
    throw new Error(`Processor mock not defined for job type ${job.data.type}`)
  }

  await processor(job)
}
