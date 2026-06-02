import { Injectable, Logger } from '@nestjs/common'
import { Job, Queue } from 'bull'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { QueueProxy } from '@shared/queue/queue.proxy'
import { TaskWithAuth } from '@shared/queue/task.input'

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

  private init(): void {
    this.queues.forEach(queue => {
      queue.on('failed', (job: Job, error: Error) => {
        try {
          const attempts = job.opts.attempts ?? 1
          const isTerminalFailure = job.attemptsMade >= attempts
          const context = {
            job: this.getJobInfo(job),
            error,
            attemptsMade: job.attemptsMade,
            attempts,
          }

          if (isTerminalFailure) {
            this.logger.error(context, 'Job failed')
          } else {
            this.logger.warn(context, 'Job attempt failed, retry scheduled by Bull')
          }
        } catch (eventHandlerError) {
          console.error('error during queue failed handling', { error: eventHandlerError })
        }
      })

      queue.on('waiting', async (jobId: number | string) => {
        try {
          const job = await queue.getJob(jobId)

          this.logger.debug(this.getJobInfo(job), 'Job waiting in queue')
        } catch (eventHandlerError) {
          console.error('error during queue waiting handling', { error: eventHandlerError })
        }
      })
    })
  }

  private getJobInfo(job: Job<TaskWithAuth> | null): {
    type: TaskWithAuth['type'] | undefined
    payload: TaskWithAuth['payload'] | undefined
    userId: number | undefined
    jobId: string | number | undefined
  } {
    return {
      type: job?.data?.type,
      payload: job?.data?.payload,
      userId: job?.data?.user?.id,
      jobId: job?.id,
    }
  }
}
