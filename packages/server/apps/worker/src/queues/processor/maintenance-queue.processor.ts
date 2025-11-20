import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { testHeapMemoryAllocationError } from '@shared/debug/memory-tests'
import { JobService } from '@shared/domain/job/job.service'
import { UserService } from '@shared/domain/user/user.service'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { SyncSpacesPermissionsJob, TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { checkUserJobsHandler } from '../../jobs/check-user-jobs.handler'
import { syncSpacesPermissionsHandler } from '../../jobs/sync-spaces-permissions.handler'
import { ProcessWithContext } from '../decorator/process-with-context'
import { BaseQueueProcessor } from './base-queue.processor'
import { DbClusterCheckNonTerminatedFacade } from 'apps/api/src/facade/db-cluster/check-non-terminated-facade/db-cluster-check-non-terminated.facade'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'

@Processor(config.workerJobs.queues.maintenance.name)
export class MaintenanceQueueProcessor extends BaseQueueProcessor {
  constructor(
    private readonly adminDataConsistencyReportService: AdminDataConsistencyReportService,
    private readonly dbClusterCheckNonTerminatedFacade: DbClusterCheckNonTerminatedFacade,
    private readonly userService: UserService,
    private readonly userCheckupFacade: UserCheckupFacade,
    private readonly jobServiceWithPlatformClient: JobService,
    private readonly jobSyncService: JobSynchronizationService,
  ) {
    super()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_CHALLENGE_JOBS)
  async checkChallengeJobs(): Promise<void> {
    await this.jobSyncService.checkChallengeJobs()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_STALE_JOBS)
  async checkStaleJobs(): Promise<void> {
    await this.jobServiceWithPlatformClient.checkStaleJobs()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS)
  async checkNonTerminatedDbClusters(): Promise<void> {
    await this.dbClusterCheckNonTerminatedFacade.checkNonTerminatedDbClusters()
  }

  @ProcessWithContext(TASK_TYPE.SYNC_SPACES_PERMISSIONS)
  async syncSpacesPermissions(job: Job<SyncSpacesPermissionsJob>): Promise<void> {
    await syncSpacesPermissionsHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.USER_CHECKUP)
  async userCheckup(job: Job): Promise<void> {
    // This is a composite job, consisting of various checks that we can do
    // to a user's account. This should be triggered when user logs in with means
    // we have a new platform accessToken to work with
    await this.userCheckupFacade.runCheckup(job)
  }

  @ProcessWithContext(TASK_TYPE.CHECK_USER_JOBS)
  async checkUserJobs(job: Job): Promise<void> {
    await checkUserJobsHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT)
  async reportAdminDataConsistency(): Promise<void> {
    await this.adminDataConsistencyReportService.createReport()
  }

  @ProcessWithContext(TASK_TYPE.USER_INACTIVITY_ALERT)
  async userInactivityAlert(): Promise<void> {
    await this.userService.sendUserInactivityAlerts()
  }

  @ProcessWithContext(TASK_TYPE.DEBUG_MAX_MEMORY)
  debugMaxMemory(): void {
    testHeapMemoryAllocationError()
  }
}
