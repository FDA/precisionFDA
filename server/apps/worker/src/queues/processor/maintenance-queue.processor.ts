import { SqlEntityManager } from '@mikro-orm/mysql'
import { Process, Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { config, debug, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, queue, user } from '@shared'
import {
  CheckNonTerminatedDbClustersJob,
  CheckStaleJobsJob,
  SyncSpacesPermissionsJob,
} from '@shared/queue/task.input'
import { Job } from 'bull'
import { CheckChallengeJobsHandler } from '../../jobs/check-challenge-jobs.handler'
import { client, job as jobDomain } from '@shared'
import { checkNonTerminatedDbClustersHandler } from '../../jobs/check-nonterminated-dbclusters.handler'
import { checkStaleJobsHandler } from '../../jobs/check-stale-jobs.handler'
import { checkUserJobsHandler } from '../../jobs/check-user-jobs.handler'
import { syncSpacesPermissionsHandler } from '../../jobs/sync-spaces-permissions.handler'
import { BaseQueueProcessor } from './base-queue.processor'

@Processor(config.workerJobs.queues.maintenance.name)
export class MaintenanceQueueProcessor extends BaseQueueProcessor {
  constructor(@Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager) {
    super()
  }

  @Process(queue.types.TASK_TYPE.CHECK_CHALLENGE_JOBS)
  async checkChallengeJobs(job: Job) {
    // TODO following will be DI refactored
    const platformClient = new client.PlatformClient(config.platform.challengeBotAccessToken)
    const jobService = new jobDomain.JobService(this.em, platformClient)
    const handler = new CheckChallengeJobsHandler(this.em, jobService)

    await handler.handle(job)
  }

  @Process(queue.types.TASK_TYPE.CHECK_STALE_JOBS)
  async checkStaleJobs(job: Job<CheckStaleJobsJob>) {
    // not used at the moment -> the job is never put to queue
    await checkStaleJobsHandler(job)
  }

  @Process(queue.types.TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS)
  async checkNonTerminatedDbClusters(job: Job<CheckNonTerminatedDbClustersJob>) {
    await checkNonTerminatedDbClustersHandler(job)
  }

  @Process(queue.types.TASK_TYPE.SYNC_SPACES_PERMISSIONS)
  async syncSpacesPermissions(job: Job<SyncSpacesPermissionsJob>) {
    await syncSpacesPermissionsHandler(job)
  }

  @Process(queue.types.TASK_TYPE.USER_CHECKUP)
  async userCheckup(job: Job) {
    // This is a composite job, consisting of various checks that we can do
    // to a user's account. This should be triggered when user logs in with means
    // we have a new platform accessToken to work with
    return await this.handleUserTask(job, async (ctx) => {
      return await new user.UserCheckupOperation(ctx).execute()
    })
  }

  @Process(queue.types.TASK_TYPE.CHECK_USER_JOBS)
  async checkUserJobs(job: Job) {
    await checkUserJobsHandler(job)
  }

  @Process(queue.types.TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT)
  async reportAdminDataConsistency(job: Job) {
    return await this.handleUserTask(job, async (ctx) => {
      return await new debug.AdminDataConsistencyReportOperation(ctx).execute()
    })
  }

  @Process(queue.types.TASK_TYPE.DEBUG_MAX_MEMORY)
  debugMaxMemory() {
    debug.testHeapMemoryAllocationError()
  }
}
