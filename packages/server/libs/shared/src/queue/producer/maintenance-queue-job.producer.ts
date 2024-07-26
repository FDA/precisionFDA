import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { BasicUserJob, TASK_TYPE } from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { JobOptions, Queue } from 'bull'

@Injectable()
export class MaintenanceQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.maintenance.name)
    protected readonly queue: Queue,
  ) {
    super()
  }

  async createCheckAdminDataConsistencyReportTask() {
    const wrapped = {
      type: TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT as const,
      payload: undefined as any,
    }

    const options: JobOptions = {
      jobId: TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT,
      repeat: {
        cron: config.workerJobs.adminDataConsistencyReport.repeatPattern,
      },
    }
    return await this.addToQueue(wrapped, options)
  }

  async createCheckChallengeJobsTask() {
    const wrapped = {
      type: TASK_TYPE.CHECK_CHALLENGE_JOBS as const,
      payload: undefined as any,
    }

    const options: JobOptions = {
      jobId: TASK_TYPE.CHECK_CHALLENGE_JOBS,
      repeat: {
        cron: config.workerJobs.checkChallengeJobs.repeatPattern,
      },
    }
    return await this.addToQueue(wrapped, options)
  }

  async createCheckNonTerminatedDbClustersTask() {
    const wrapped = {
      type: TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS as const,
      payload: undefined as any,
    }

    const options: JobOptions = {
      jobId: TASK_TYPE.CHECK_NON_TERMINATED_DBCLUSTERS,
      repeat: {
        cron: config.workerJobs.nonTerminatedDbClusters.repeatPattern,
      },
    }
    return await this.addToQueue(wrapped, options)
  }

  async createUserInactivityAlertTask() {
    const wrapped = {
      type: TASK_TYPE.USER_INACTIVITY_ALERT as const,
      payload: undefined as any
    }

    const options: JobOptions = {
      jobId: TASK_TYPE.USER_INACTIVITY_ALERT,
      repeat: {
        cron: config.workerJobs.userInactivityAlert.repeatPattern,
      },
    }
    return await this.addToQueue(wrapped, options)
  }

  async createCheckStaleJobsTask(user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.CHECK_STALE_JOBS as const,
      payload: undefined as any,
      user,
    }

    const options: JobOptions = { jobId: TASK_TYPE.CHECK_STALE_JOBS }
    return await this.addToQueue(wrapped, options)
  }

  async createSyncSpacesPermissionsTask(user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.SYNC_SPACES_PERMISSIONS as const,
      payload: undefined as any,
      user,
    }

    const options: JobOptions = { jobId: TASK_TYPE.SYNC_SPACES_PERMISSIONS }
    return await this.addToQueue(wrapped, options)
  }

  async createUserCheckupTask(data: BasicUserJob) {
    const wrapped = {
      type: TASK_TYPE.USER_CHECKUP as const,
      user: data.user,
    }
    const options: JobOptions = { jobId: `${wrapped.type}.${data.user.dxuser}` }
    return await this.addToQueue(wrapped, options)
  }

  async createCheckUserJobsTask(data: BasicUserJob) {
    const wrapped = {
      type: TASK_TYPE.CHECK_USER_JOBS as const,
      user: data.user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${data.user.dxuser}`,
    }
    return await this.addToQueue(wrapped, options)
  }

  async createTestMaxMemoryTask(): Promise<any> {
    await this.removeJobs(TASK_TYPE.DEBUG_MAX_MEMORY)

    const data = {
      type: TASK_TYPE.DEBUG_MAX_MEMORY as const,
    }

    const options: JobOptions = {
      jobId: TASK_TYPE.DEBUG_MAX_MEMORY,
    }
    return await this.addToQueue(data, options)
  }
}
