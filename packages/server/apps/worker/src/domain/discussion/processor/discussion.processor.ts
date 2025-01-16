import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { DiscussionNotificationService } from '@shared/domain/discussion/services/discussion-notification.service'
import { NotifyNewDiscussionJob, TASK_TYPE } from '@shared/queue/task.input'
import { ProcessWithContext } from 'apps/worker/src/queues/decorator/process-with-context'
import { Job } from 'bull'

@Processor(config.workerJobs.queues.default.name)
export class DiscussionQueueProcessor {
  constructor(private readonly discussionNotificationService: DiscussionNotificationService) {}

  @ProcessWithContext(TASK_TYPE.NOTIFY_SPACE_DISCUSSION)
  async notifyNewDiscussion(job: Job<NotifyNewDiscussionJob>) {
    const { discussionId, notify } = job.data.payload

    await this.discussionNotificationService.notifySpaceDiscussion(discussionId, notify)
  }
}
