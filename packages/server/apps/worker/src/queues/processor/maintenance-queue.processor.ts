import { Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { config } from '@shared/config'
import { testHeapMemoryAllocationError } from '@shared/debug/memory-tests'
import { AdminDataConsistencyReportService } from '@shared/debug/admin-data-consistency-report.service'
import { JobService } from '@shared/domain/job/job.service'
import { UserCheckupOperation } from '@shared/domain/user/ops/user-checkup'
import { UserService } from '@shared/domain/user/user.service'
import { SyncSpacesPermissionsJob, TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { checkUserJobsHandler } from '../../jobs/check-user-jobs.handler'
import { syncSpacesPermissionsHandler } from '../../jobs/sync-spaces-permissions.handler'
import { ProcessWithContext } from '../decorator/process-with-context'
import { BaseQueueProcessor } from './base-queue.processor'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'

@Processor(config.workerJobs.queues.maintenance.name)
export class MaintenanceQueueProcessor extends BaseQueueProcessor {
  constructor(
    private readonly adminDataConsistencyReportService: AdminDataConsistencyReportService,
    private readonly dbClusterService: DbClusterService,
    private readonly userService: UserService,
    private readonly jobServiceWithPlatformClient: JobService,
    @Inject('JOB_SERVICE_WITH_CHALLENGE_BOT_CLIENT')
    private readonly jobServiceWithChallengeBotClient: JobService,
  ) {
    super()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_CHALLENGE_JOBS)
  async checkChallengeJobs() {
    await this.jobServiceWithChallengeBotClient.checkChallengeJobs()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_STALE_JOBS)
  async checkStaleJobs() {
    await this.jobServiceWithPlatformClient.checkStaleJobs()
  }

  @ProcessWithContext(TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS)
  async checkNonTerminatedDbClusters() {
    await this.dbClusterService.checkNonTerminatedDbClusters()
  }

  @ProcessWithContext(TASK_TYPE.SYNC_SPACES_PERMISSIONS)
  async syncSpacesPermissions(job: Job<SyncSpacesPermissionsJob>) {
    await syncSpacesPermissionsHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.USER_CHECKUP)
  async userCheckup(job: Job) {
    // This is a composite job, consisting of various checks that we can do
    // to a user's account. This should be triggered when user logs in with means
    // we have a new platform accessToken to work with
    return await this.handleUserTask(job, async (ctx) => {
      return await new UserCheckupOperation(ctx).execute()
    })
  }

  @ProcessWithContext(TASK_TYPE.CHECK_USER_JOBS)
  async checkUserJobs(job: Job) {
    await checkUserJobsHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT)
  async reportAdminDataConsistency() {
    await this.adminDataConsistencyReportService.createReport()
  }

  @ProcessWithContext(TASK_TYPE.USER_INACTIVITY_ALERT)
  async userInactivityAlert() {
    await this.userService.sendUserInactivityAlerts()
  }

  @ProcessWithContext(TASK_TYPE.DEBUG_MAX_MEMORY)
  debugMaxMemory() {
    testHeapMemoryAllocationError()
  }
}
