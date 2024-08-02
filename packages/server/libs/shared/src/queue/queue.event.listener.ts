import { Injectable, Logger } from '@nestjs/common'
import { QueueProxy } from '@shared/queue/queue.proxy'
import { TaskWithAuth } from '@shared/queue/task.input'
import { Job, Queue } from 'bull'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class QueueEventListener {
  @ServiceLogger()
  private readonly logger: Logger

  private readonly queues: Queue[] = []

  constructor(queueProxy: QueueProxy) {
    this.queues.push(queueProxy.mainQueue)
    this.queues.push(queueProxy.maintenanceQueue)
    this.queues.push(queueProxy.emailQueue)
    this.queues.push(queueProxy.fileSyncQueue)
    this.queues.push(queueProxy.spaceReportQueue)

    this.init()
  }

  private init() {
    this.queues.forEach((queue) => {
      queue.on('failed', (job: Job, error: Error) => {
        try {
          this.logger.error({ job: this.getJobInfo(job), error }, 'Job failed')
        } catch (error) {
          console.error('error during queue failed handling', { error })
        }
      })

      queue.on('waiting', async (jobId: number) => {
        try {
          const job = await queue.getJob(jobId)

          this.logger.debug(this.getJobInfo(job), 'Job waiting in queue')
        } catch (error) {
          console.error('error during queue waiting handling', { error })
        }
      })
    })
  }

  private getJobInfo(job: Job<TaskWithAuth>) {
    return {
      type: job?.data?.type,
      payload: job?.data?.payload,
      userId: job?.data?.user?.id,
      jobId: job?.id,
    }
  }
}
