import { Injectable, Logger } from '@nestjs/common'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { findRepeatable, getMainQueue, removeRepeatableJob } from '@shared/queue'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { isJobOrphaned } from '@shared/queue/queue.utils'

@Injectable()
export class JobSyncTaskCheckFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly jobService: JobService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async recreateJobSyncIfMissing(): Promise<void> {
    const nonTerminalJobs = await this.jobService.findRunningJobsByUser()
    if (nonTerminalJobs.length === 0) {
      this.logger.log(
        {
          dxuser: this.user.dxuser,
        },
        'No non-terminal jobs found for user, no need to recreate job sync task',
      )
      return
    }

    for (const job of nonTerminalJobs) {
      const bullJobId = JobSynchronizationService.getBullJobId(job.dxid)
      const bullJob = await findRepeatable(bullJobId)
      if (!bullJob) {
        this.logger.log({}, `Recreated missing SyncJobOperation for ${job.dxid}`)
        await this.mainQueueJobProducer.createSyncJobStatusTask({ dxid: job.dxid })
      } else if (isJobOrphaned(bullJob)) {
        this.logger.log(
          {
            jobDxid: job.dxid,
            bullJob,
          },
          'Status sync task found, but it is orphaned. Removing and recreating it',
        )
        await removeRepeatableJob(bullJob, getMainQueue())
        await this.mainQueueJobProducer.createSyncJobStatusTask({ dxid: job.dxid })
      }
    }
  }
}
