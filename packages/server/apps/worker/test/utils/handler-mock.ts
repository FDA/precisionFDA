import { UserService } from '@shared/domain/user/user.service'
import { Task, TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { EmailQueueProcessor } from '../../src/domain/email/processor/email-queue.processor'
import { FileSyncQueueProcessor } from '../../src/domain/user-file/processor/file-sync-queue.processor'
import { MainQueueProcessor } from '../../src/queues/processor/main-queue.processor'
import { MaintenanceQueueProcessor } from '../../src/queues/processor/maintenance-queue.processor'
import { UserDataConsistencyReportService } from '@shared/domain/user/user-data-consistency-report.service'
import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { JobService } from '@shared/domain/job/job.service'

const dbClusterService = {} as DbClusterService

const adminDataConsistencyReportService = {
  createReport: () => {},
} as AdminDataConsistencyReportService

const userService = {
  sendUserInactivityAlerts: () => {},
} as UserService


const userDataConsistencyReportService = {
  createReport: () => {},
} as UserDataConsistencyReportService

const jobServiceUserClient = {
  checkStaleJobs: () => {},
} as JobService
const jobServiceChallengeBotClient = {
  checkChallengeJobs: () => {},
} as JobService

const processor = {
  MAIN: () => new MainQueueProcessor(),
  MAINTENANCE: () =>
    new MaintenanceQueueProcessor(
      adminDataConsistencyReportService,
      dbClusterService,
      userService,
      jobServiceUserClient,
      jobServiceChallengeBotClient,
    ),
  FILE: () => new FileSyncQueueProcessor(userDataConsistencyReportService, jobServiceUserClient),
  EMAIL: () => new EmailQueueProcessor(),
}

const jobToProcessorMap: Partial<Record<TASK_TYPE, (job: Job) => Promise<void> | void>> = {
  [TASK_TYPE.SYNC_FILES_STATE]: (job) => processor.MAIN().syncFilesState(job),
  [TASK_TYPE.CHECK_CHALLENGE_JOBS]: () => processor.MAINTENANCE().checkChallengeJobs(),
  [TASK_TYPE.SYNC_JOB_OUTPUTS]: (job) => processor.FILE().syncJobOutputs(job),
  [TASK_TYPE.SYNC_JOB_STATUS]: (job) => processor.MAIN().syncJobStatus(job),
  [TASK_TYPE.WORKSTATION_SNAPSHOT]: (job) => processor.FILE().createWorkstationSnapshot(job),
  [TASK_TYPE.SEND_EMAIL]: (job) => processor.EMAIL().sendEmail(job),
  [TASK_TYPE.CHECK_STALE_JOBS]: () => processor.MAINTENANCE().checkStaleJobs(),
  [TASK_TYPE.REMOVE_NODES]: (job) => processor.FILE().removeNodes(job),
  [TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS]: () =>
    processor.MAINTENANCE().checkNonTerminatedDbClusters(),
  [TASK_TYPE.SYNC_DBCLUSTER_STATUS]: (job) => processor.MAIN().syncDbClusterStatus(job),
  [TASK_TYPE.SYNC_SPACES_PERMISSIONS]: (job) => processor.MAINTENANCE().syncSpacesPermissions(job),
  [TASK_TYPE.USER_CHECKUP]: (job) => processor.MAINTENANCE().userCheckup(job),
  [TASK_TYPE.USER_INACTIVITY_ALERT]: (job) => processor.MAINTENANCE().userInactivityAlert(),
  [TASK_TYPE.USER_DATA_CONSISTENCY_REPORT]: () => processor.FILE().reportUserDataConsistency(),
  [TASK_TYPE.CHECK_USER_JOBS]: (job) => processor.MAINTENANCE().checkUserJobs(job),
  [TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT]: () =>
    processor.MAINTENANCE().reportAdminDataConsistency(),
  [TASK_TYPE.DEBUG_MAX_MEMORY]: () => processor.MAINTENANCE().debugMaxMemory(),
  [TASK_TYPE.LOCK_NODES]: (job) => processor.FILE().lockNodes(job),
  [TASK_TYPE.UNLOCK_NODES]: (job) => processor.FILE().unlockNodes(job),
}

// TODO(PFDA-4831) - remove and replace usages by actual job creation in redis
export const mockHandler = async (job: Job<Task>) => {
  const processor = jobToProcessorMap[job.data.type]

  if (!processor) {
    throw new Error(`Processor mock not defined for job type ${job.data.type}`)
  }

  await processor(job)
}
