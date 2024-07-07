import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { SendEmailJob, TASK_TYPE } from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { TimeUtils } from '@shared/utils/time.utils'
import { JobOptions, Queue } from 'bull'
import { getBullJobIdForEmailOperation } from '@shared/domain/email/email.helper'

@Injectable()
export class EmailQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.emails.name)
    protected readonly queue: Queue,
  ) {
    super()
  }

  // Specifying a taskId will prevent multiple emails of that
  // type and id to be sent
  async createSendEmailTask(
    data: SendEmailJob['payload'],
    user: UserCtx | undefined,
    taskId?: string,
  ) {
    const wrapped = {
      type: TASK_TYPE.SEND_EMAIL as const,
      payload: data,
      user,
    }
    const options: JobOptions = taskId
      ? {
          jobId: taskId,
          // The following is important for emails that should not be repeated
          removeOnComplete: { age: TimeUtils.daysToSeconds(1), count: 100 },
          removeOnFail: { age: TimeUtils.weeksToSeconds(1), count: 500 },
        }
      : {
          jobId: getBullJobIdForEmailOperation(data.emailType),
        }
    const handlePayloadFn = (payload: SendEmailJob['payload']): SendEmailJob['payload'] => ({
      ...payload,
      body: '[too-long]',
    })

    return this.addToQueue(wrapped, options, handlePayloadFn)
  }
}
