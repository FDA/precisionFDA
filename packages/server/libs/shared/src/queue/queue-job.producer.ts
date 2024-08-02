import { Logger } from '@nestjs/common'
import { InvalidStateError } from '@shared/errors'
import { getJobStatusMessageWithElapsedTime } from '@shared/queue/queue.utils'
import { Task } from '@shared/queue/task.input'
import { Job, JobOptions, Queue } from 'bull'

export abstract class QueueJobProducer {
  protected readonly logger = new Logger('QueueJobProducer')

  protected abstract queue: Queue

  protected async addToQueue<T extends Task>(
    task: T,
    options?: JobOptions,
    payloadFn?: (payload: any) => any,
  ): Promise<Job<T>> {
    this.validateQueue()

    this.logger.log(
      { task: this.getTaskInfo(task, payloadFn), job: { id: options?.jobId } },
      'adding a task to queue',
    )

    return await this.queue.add(task.type, task, options)
  }

  protected async addBulkToQueue<T extends Task>(tasks: Parameters<Queue<T>['addBulk']>[0]) {
    this.validateQueue()

    this.logger.log(
      { tasks: tasks.map((t) => this.getTaskInfo(t.data)) },
      'adding a bulk of task to queue',
    )

    return await this.queue.addBulk(tasks.map((t) => ({ name: t.data.type, data: t.data })))
  }

  removeJobs(pattern: string) {
    return this.queue.removeJobs(pattern)
  }

  // addToQueueEnsureUnique adds a non-repeatable job to the queue but does not
  //    allow a duplicate job with the same bull jobId to be added
  //    repeatable jobs should not use this function
  // TODO: The queue methods should be cleaned up and a lot of code could be consolidated
  async addToQueueEnsureUnique<T extends Task>(task: T, jobId: string | undefined) {
    // If jobId is provided, there should not be multiple items with this jobId in the queue
    if (jobId) {
      // Do not allow a second job to be added to the queue
      const existingJob = await this.queue.getJob(jobId)
      if (existingJob) {
        const errorMessage = existingJob.hasOwnProperty('getState')
          ? await getJobStatusMessageWithElapsedTime(existingJob, task.type)
          : `Job with id ${jobId} already exists in queue`
        throw new InvalidStateError(errorMessage)
      }
    }

    const options: JobOptions = {
      jobId,
    }
    return await this.addToQueue(task, options)
  }

  private getTaskInfo(task: Task, payloadFn?: (payload: unknown) => unknown) {
    const whitelistPayloadFn = payloadFn ?? ((payload) => payload)

    return {
      type: task.type,
      // TODO(samuel) fix
      payload: whitelistPayloadFn((task as any).payload),
      userId: (task as any)?.user?.id,
    }
  }

  private validateQueue() {
    if (!this.queue) {
      throw new Error('Queue not defined. Define queue to produce jobs.')
    }
  }
}
