import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Queue } from 'bull'

@Injectable()
export class DiscussionQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name)
    protected readonly queue: Queue,
    private readonly user: UserContext,
  ) {
    super()
  }

  async createSpaceNotificationTask(discussionId: number, notifyAll: boolean) {
    const wrapped = {
      type: TASK_TYPE.NOTIFY_SPACE_DISCUSSION as const,
      payload: {
        discussionId,
        notifyAll,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }
}
