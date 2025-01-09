import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Queue } from 'bull'
import { NotifyType } from '@shared/domain/discussion/dto/notify.type'

@Injectable()
export class DiscussionQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name)
    protected readonly queue: Queue,
    private readonly user: UserContext,
  ) {
    super()
  }

  /**
   * Create a new discussion notification task
   * @param discussionId
   * @param notify - list of usernames to notify OR 'all' to notify all users OR 'author' to notify the author only
   */
  async createSpaceNotificationTask(discussionId: number, notify: NotifyType) {
    const wrapped = {
      type: TASK_TYPE.NOTIFY_SPACE_DISCUSSION as const,
      payload: {
        discussionId,
        notify,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }
}
