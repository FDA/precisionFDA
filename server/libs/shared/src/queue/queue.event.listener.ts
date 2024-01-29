import { Injectable, Logger } from '@nestjs/common'
import { QueueProxy } from '@shared/queue/queue.proxy'
import { TaskWithAuth } from '@shared/queue/task.input'
import { Job, Queue } from 'bull'

@Injectable()
export class QueueEventListener {
  private readonly queues: Queue[] = []

  private readonly log = new Logger('queue event listener')

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
        this.log.error({ job: this.getJobInfo(job), error }, 'Job failed')
      })

      queue.on('waiting', async (jobId: number) => {
        const job = await queue.getJob(jobId)

        this.log.debug(this.getJobInfo(job), 'Job waiting in queue')
      })
    })
  }

  private getJobInfo(job: Job<TaskWithAuth>) {
    return {
      type: job.data?.type,
      payload: job.data?.payload,
      userId: job.data?.user?.id,
      jobId: job.id,
    }
  }
}
