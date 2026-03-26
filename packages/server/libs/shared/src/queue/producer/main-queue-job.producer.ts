import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { NotifyType } from '@shared/domain/discussion/dto/notify.type'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import {
  FileUidInput,
  SyncFileJobInput,
  UidAndFollowUpInput,
} from '@shared/domain/user-file/user-file.input'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import {
  CheckStatusJob,
  SyncDbClusterJob,
  SyncDbClusterJobOutput,
  TASK_TYPE,
  UiNotifyNewDiscussionReplyJob,
} from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { Job, JobOptions, Queue } from 'bull'

@Injectable()
export class MainQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name)
    protected readonly queue: Queue,
    private readonly user: UserContext,
  ) {
    super()
  }

  async createSyncFilesStateTask(user: UserCtx): Promise<Job> {
    this.logger.log({ userId: user.id }, 'Creating SyncFilesStateTask')

    const task = {
      type: TASK_TYPE.SYNC_FILES_STATE as const,
      user,
    }

    const options: JobOptions = {
      // There should only be one sync files state task per user
      jobId: SyncFilesStateFacade.getBullJobId(user.dxuser),
      repeat: { cron: config.workerJobs.syncFiles.repeatPattern },
    }

    return await this.addToQueue(task, options)
  }

  async createSyncJobStatusTask(data: CheckStatusJob['payload']): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.SYNC_JOB_STATUS as const,
      payload: data,
      user: this.user,
    }
    // unique jobId ensures that every createTask call actually creates a new repeatable job
    // even with the same payload! -> have to clean up the queue correctly

    // We should prevent new sync jobs to be added
    //
    // If we use the dxid of the job as the Bull jobID, it would prevent repeated queueing but
    // it prevents future addition of this job after syncing has stopped.

    const options: JobOptions = {
      // There should only be one sync job task
      jobId: JobSynchronizationService.getBullJobId(data.dxid),
      repeat: { cron: config.workerJobs.syncJob.repeatPattern },
    }

    return await this.addToQueue(wrapped, options)
  }

  async createRunFollowUpActionJobTask(
    payload: UidAndFollowUpInput,
    user?: UserCtx,
  ): Promise<void> {
    const wrapped = {
      type: TASK_TYPE.FOLLOW_UP_ACTION as const,
      payload,
      user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.uid}.${Date.now()}`,
    }

    await this.addToQueue(wrapped, options)
  }

  async createFileSynchronizeJobTask(
    payload: SyncFileJobInput,
    user?: UserCtx,
    delayInMs?: number,
  ): Promise<void> {
    const wrapped = {
      type: TASK_TYPE.SYNC_FILE_STATE as const,
      payload,
      user,
    }

    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.fileUid}`,
      delay: delayInMs ?? 0,
    }

    await this.addToQueue(wrapped, options)
  }

  async createCloseFileJobTask(payload: FileUidInput, user?: UserCtx): Promise<void> {
    const wrapped = {
      type: TASK_TYPE.CLOSE_FILE as const,
      payload,
      user,
    }

    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.fileUid}`,
    }

    await this.addToQueue(wrapped, options)
  }

  async createDbClusterSyncTask(data: SyncDbClusterJob['payload'], user: UserCtx): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.SYNC_DBCLUSTER_STATUS as const,
      payload: data,
      user,
    }

    const options: JobOptions = {
      jobId: SyncDbClusterOperation.getBullJobId(data.dxid),
      repeat: { cron: config.workerJobs.syncDbClusters.repeatPattern },
    }

    return await this.addToQueue(wrapped, options)
  }

  async createDbClusterSyncJobOutputTask(
    data: SyncDbClusterJobOutput['payload'],
    user: UserCtx,
  ): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.SYNC_DBCLUSTER_JOB_OUTPUT as const,
      payload: data,
      user,
    }

    const options: JobOptions = {
      jobId: `${TASK_TYPE.SYNC_DBCLUSTER_JOB_OUTPUT}.${data.jobDxid}`,
      repeat: { cron: config.workerJobs.syncDbClusterJobOutput.repeatPattern },
    }

    return await this.addToQueue(wrapped, options)
  }

  /**
   * Create a new discussion notification task
   * @param discussionId
   * @param notify - list of usernames to notify OR 'all' to notify all users OR 'author' to notify the author only
   */
  async createNewDiscussionNotificationTask(
    discussionId: number,
    notify: NotifyType,
  ): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.NOTIFY_NEW_DISCUSSION as const,
      payload: {
        discussionId,
        notify,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }

  /**
   * Create a new discussion notification task
   * @param discussionId
   * @param notify - list of usernames to notify OR 'all' to notify all users OR 'author' to notify the author only
   */
  async createNewReplyNotificationTask(discussionId: number, notify: NotifyType): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.NOTIFY_NEW_DISCUSSION_REPLY as const,
      payload: {
        discussionId,
        notify,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }

  async createNewReplyUINotificationTask(
    spaceId: number,
    type: DISCUSSION_REPLY_TYPE,
    replyUrl: string,
  ): Promise<Job<UiNotifyNewDiscussionReplyJob>> {
    const wrapped = {
      type: TASK_TYPE.UI_NOTIFY_NEW_DISCUSSION_REPLY as const,
      payload: {
        spaceId,
        type,
        replyUrl,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }

  async createProvisionNewUsersTask(ids: number[], spaceIds: number[]): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.PROVISION_NEW_USERS as const,
      payload: {
        ids,
        spaceIds,
      },
      user: this.user,
    }

    return await this.addToQueue(wrapped)
  }
}
