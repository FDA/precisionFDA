import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Queue } from 'bull'

@Injectable()
export class SpaceReportQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.spaceReport.name)
    protected readonly queue: Queue,
  ) {
    super()
  }

  async createBatchTasks(batches: number[][], user: UserContext) {
    const wrapped = batches.map((b) => ({
      data: {
        type: TASK_TYPE.GENERATE_SPACE_REPORT_BATCH as const,
        payload: b,
        user,
      },
    }))

    return await this.addBulkToQueue(wrapped)
  }

  async createResultTask(reportId: number, user: UserContext) {
    const wrapped = {
      type: TASK_TYPE.GENERATE_SPACE_REPORT_RESULT as const,
      payload: reportId,
      user,
    }

    return await this.addToQueue(wrapped)
  }
}
