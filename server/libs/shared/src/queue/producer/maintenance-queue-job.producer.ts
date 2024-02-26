import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { BasicUserJob, TASK_TYPE } from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { JobOptions, Queue } from 'bull'
import { undefined } from 'zod'

@Injectable()
export class MaintenanceQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.maintenance.name)
    protected readonly queue: Queue,
  ) {
    super()
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
    const options: JobOptions = { jobId: `${wrapped.type}.${data.user.dxuser}` }
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
