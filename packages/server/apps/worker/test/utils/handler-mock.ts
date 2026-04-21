import { DbClusterCheckNonTerminatedFacade } from 'apps/api/src/facade/db-cluster/check-non-terminated-facade/db-cluster-check-non-terminated.facade'
import { Job } from 'bull'
import { Logger } from '@nestjs/common'
import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { EmailService } from '@shared/domain/email/email.service'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { JobRunningNotificationFacade } from '@shared/facade/job/job-running-notification.facade'
import { JobStaleCheckFacade } from '@shared/facade/job/job-stale-check.facade'
import { JobSyncTaskCheckFacade } from '@shared/facade/job/job-sync-task-check.facade'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { SpaceMemberNotificationFacade } from '@shared/facade/space-member-notification/space-member-notification.facade'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { UserProvisionFacade } from '@shared/facade/user/user-provision.facade'
import { TASK_TYPE, Task } from '@shared/queue/task.input'
import { DbClusterSynchronizeFacade } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize.facade'
import { FollowUpDecider } from '../../src/domain/user-file/follow-up-decider'
import { EmailQueueProcessor } from '../../src/domain/email/processor/email-queue.processor'
import { FileSyncQueueProcessor } from '../../src/domain/user-file/processor/file-sync-queue.processor'
import { MainQueueProcessor } from '../../src/queues/processor/main-queue.processor'
import { MaintenanceQueueProcessor } from '../../src/queues/processor/maintenance-queue.processor'

const dbClusterCheckNonTerminatedFacade = {
  checkNonTerminatedDbClusters: () => {},
} as unknown as DbClusterCheckNonTerminatedFacade

const adminDataConsistencyReportService = {
  createReport: () => {},
} as unknown as AdminDataConsistencyReportService

const spaceMembershipService = {} as unknown as SpaceMembershipService

const userService = {
  sendUserInactivityAlerts: () => {},
} as unknown as UserService

const userDataConsistencyReportFacade = {
  createReport: () => {},
  fixInconsistentData: () => {},
} as unknown as UserDataConsistencyReportFacade

const userCheckupFacade = {
  runCheckup: (_job: Job) => {},
} as unknown as UserCheckupFacade

const jobServiceUserClient = {} as unknown as JobService
const jobSyncTaskCheckFacade = {
  recreateJobSyncIfMissing: () => {},
} as unknown as JobSyncTaskCheckFacade

const jobStaleCheckFacade = {
  checkAndNotifyStaleJobs: () => {},
} as unknown as JobStaleCheckFacade

const jobRunningNotificationFacade = {
  notifyOwnersOfRunningJobs: () => {},
} as unknown as JobRunningNotificationFacade

const jobSyncService = {
  checkChallengeJobs: () => {},
} as unknown as JobSynchronizationService

const userCtx = {} as unknown as UserContext
const removeNodesFacade = {} as unknown as RemoveNodesFacade
const copyNodesFacade = {} as unknown as CopyNodesFacade
const notificationService = {} as unknown as NotificationService
const emailSendService = {} as unknown as EmailSendService
const logger = {} as unknown as Logger
const nodeService = {} as unknown as NodeService
const challengeService = {} as unknown as ChallengeService
const dataPortalService = {} as unknown as DataPortalService
const followUpDecider = {} as unknown as FollowUpDecider
const spaceReportService = {} as unknown as SpaceReportService
const syncFilesStateFacade = {} as unknown as SyncFilesStateFacade
const dbClusterSynchronizeFacade = {} as unknown as DbClusterSynchronizeFacade
const emailService = {} as unknown as EmailService
const userProvisionFacade = {} as unknown as UserProvisionFacade
const spaceMemberNotificationFacade = {} as unknown as SpaceMemberNotificationFacade
const jobWorkstationFacade = {} as unknown as JobWorkstationFacade

const processor = {
  MAIN: (): MainQueueProcessor =>
    new MainQueueProcessor(
      logger,
      userCtx,
      nodeService,
      challengeService,
      dataPortalService,
      followUpDecider,
      spaceReportService,
      syncFilesStateFacade,
      dbClusterSynchronizeFacade,
      emailService,
      jobServiceUserClient,
      userProvisionFacade,
      spaceMemberNotificationFacade,
    ),
  MAINTENANCE: (): MaintenanceQueueProcessor =>
    new MaintenanceQueueProcessor(
      adminDataConsistencyReportService,
      dbClusterCheckNonTerminatedFacade,
      userService,
      spaceMembershipService,
      userCheckupFacade,
      jobStaleCheckFacade,
      jobRunningNotificationFacade,
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
      copyNodesFacade,
      notificationService,
      jobServiceUserClient,
      jobWorkstationFacade,
    ),
  EMAIL: (): EmailQueueProcessor => new EmailQueueProcessor(emailSendService),
}

const jobToProcessorMap: Partial<Record<TASK_TYPE, (job: Job) => Promise<void> | void>> = {
  [TASK_TYPE.SYNC_FILES_STATE]: (job: Job): Promise<void> => processor.MAIN().syncFilesState(job),
  [TASK_TYPE.CHECK_CHALLENGE_JOBS]: (): Promise<void> => processor.MAINTENANCE().checkChallengeJobs(),
  [TASK_TYPE.SYNC_JOB_OUTPUTS]: (job: Job): Promise<void> => processor.FILE().syncJobOutputs(job),
  [TASK_TYPE.SYNC_JOB_STATUS]: (job: Job): Promise<void> => processor.MAIN().syncJobStatus(job),
  [TASK_TYPE.WORKSTATION_SNAPSHOT]: (job: Job): Promise<void> => processor.FILE().createWorkstationSnapshot(job),
  [TASK_TYPE.SEND_EMAIL]: (job: Job): Promise<void> => processor.EMAIL().sendEmail(job),
  [TASK_TYPE.CHECK_STALE_JOBS]: (): Promise<void> => processor.MAINTENANCE().checkStaleJobs(),
  [TASK_TYPE.NOTIFY_RUNNING_JOBS]: (): Promise<void> => processor.MAINTENANCE().notifyRunningJobs(),
  [TASK_TYPE.REMOVE_NODES]: (job: Job): Promise<void> => processor.FILE().removeNodes(job),
  [TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS]: (): Promise<void> =>
    processor.MAINTENANCE().checkNonTerminatedDbClusters(),
  [TASK_TYPE.SYNC_DBCLUSTER_STATUS]: (job: Job): Promise<void> => processor.MAIN().syncDbClusterStatus(job),
  [TASK_TYPE.SYNC_SPACES_PERMISSIONS]: (job: Job): Promise<void> => processor.MAINTENANCE().syncSpacesPermissions(job),
  [TASK_TYPE.USER_CHECKUP]: (job: Job): Promise<void> => processor.MAINTENANCE().userCheckup(job),
  [TASK_TYPE.USER_INACTIVITY_ALERT]: (): Promise<void> => processor.MAINTENANCE().userInactivityAlert(),
  [TASK_TYPE.USER_DATA_CONSISTENCY_REPORT]: (): Promise<void> => processor.FILE().reportUserDataConsistency(),
  [TASK_TYPE.CHECK_USER_JOBS]: (): Promise<void> => processor.MAINTENANCE().checkUserJobs(),
  [TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT]: (): Promise<void> => processor.MAINTENANCE().reportAdminDataConsistency(),
  [TASK_TYPE.DEBUG_MAX_MEMORY]: (): void => processor.MAINTENANCE().debugMaxMemory(),
  [TASK_TYPE.LOCK_NODES]: (job: Job): Promise<void> => processor.FILE().lockNodes(job),
  [TASK_TYPE.UNLOCK_NODES]: (job: Job): Promise<void> => processor.FILE().unlockNodes(job),
}

// TODO(PFDA-4831) - remove and replace usages by actual job creation in redis
export const mockHandler = async (job: Job<Task>): Promise<void> => {
  const processFn = jobToProcessorMap[job.data.type]

  if (!processFn) {
    throw new Error(`Processor mock not defined for job type ${job.data.type}`)
  }

  await processFn(job)
}
