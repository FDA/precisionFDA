import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserService } from '@shared/domain/user/service/user.service'
import { JobStaleCheckFacade } from '@shared/facade/job/job-stale-check.facade'
import { JobSyncTaskCheckFacade } from '@shared/facade/job/job-sync-task-check.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { Task, TASK_TYPE } from '@shared/queue/task.input'
import { DbClusterCheckNonTerminatedFacade } from 'apps/api/src/facade/db-cluster/check-non-terminated-facade/db-cluster-check-non-terminated.facade'
import { Job } from 'bull'
import { EmailQueueProcessor } from '../../src/domain/email/processor/email-queue.processor'
import { FileSyncQueueProcessor } from '../../src/domain/user-file/processor/file-sync-queue.processor'
import { MainQueueProcessor } from '../../src/queues/processor/main-queue.processor'
import { MaintenanceQueueProcessor } from '../../src/queues/processor/maintenance-queue.processor'

const dbClusterCheckNonTerminatedFacade = {
  checkNonTerminatedDbClusters: () => {},
} as unknown as DbClusterCheckNonTerminatedFacade

const adminDataConsistencyReportService = {
  createReport: () => {},
} as AdminDataConsistencyReportService

const spaceMembershipService = {} as unknown as SpaceMembershipService

const userService = {
  sendUserInactivityAlerts: () => {},
} as UserService

const userDataConsistencyReportFacade = {
  createReport: () => {},
  fixInconsistentData: () => {},
} as unknown as UserDataConsistencyReportFacade

const userCheckupFacade = {
  runCheckup: (job: Job) => {
    console.log(job)
  },
} as UserCheckupFacade

const jobServiceUserClient = {} as JobService
const jobSyncTaskCheckFacade = {
  recreateJobSyncIfMissing: () => {},
} as unknown as JobSyncTaskCheckFacade

const jobStaleCheckFacade = {
  checkAndNotifyStaleJobs: () => {},
} as unknown as JobStaleCheckFacade

const jobSyncService = {
  checkChallengeJobs: () => {},
} as JobSynchronizationService

const userCtx = {} as unknown as UserContext
const removeNodesFacade = {} as unknown as RemoveNodesFacade
const notificationService = {} as unknown as NotificationService
const emailSendService = {} as EmailSendService

const processor = {
  MAIN: (): MainQueueProcessor => new MainQueueProcessor(),
  MAINTENANCE: (): MaintenanceQueueProcessor =>
    new MaintenanceQueueProcessor(
      adminDataConsistencyReportService,
      dbClusterCheckNonTerminatedFacade,
      userService,
      spaceMembershipService,
      userCheckupFacade,
      jobStaleCheckFacade,
      jobSyncTaskCheckFacade,
      jobSyncService,
    ),
  FILE: (): FileSyncQueueProcessor =>
    new FileSyncQueueProcessor(
      userCtx,
      userDataConsistencyReportFacade,
      {} as unknown as LockNodeFacade,
      {} as unknown as UnlockNodeFacade,
      removeNodesFacade,
      notificationService,
      jobServiceUserClient,
    ),
  EMAIL: (): EmailQueueProcessor => new EmailQueueProcessor(emailSendService),
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
  [TASK_TYPE.USER_INACTIVITY_ALERT]: () => processor.MAINTENANCE().userInactivityAlert(),
  [TASK_TYPE.USER_DATA_CONSISTENCY_REPORT]: () => processor.FILE().reportUserDataConsistency(),
  [TASK_TYPE.CHECK_USER_JOBS]: (job) => processor.MAINTENANCE().checkUserJobs(job),
  [TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT]: () =>
    processor.MAINTENANCE().reportAdminDataConsistency(),
  [TASK_TYPE.DEBUG_MAX_MEMORY]: () => processor.MAINTENANCE().debugMaxMemory(),
  [TASK_TYPE.LOCK_NODES]: (job) => processor.FILE().lockNodes(job),
  [TASK_TYPE.UNLOCK_NODES]: (job) => processor.FILE().unlockNodes(job),
}

// TODO(PFDA-4831) - remove and replace usages by actual job creation in redis
export const mockHandler = async (job: Job<Task>): Promise<void> => {
  const processor = jobToProcessorMap[job.data.type]

  if (!processor) {
    throw new Error(`Processor mock not defined for job type ${job.data.type}`)
  }

  await processor(job)
}
