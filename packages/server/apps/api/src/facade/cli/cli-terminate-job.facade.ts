import { Injectable, Logger } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class CliTerminateJobFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly jobService: JobService,
    private readonly jobSynchronizationService: JobSynchronizationService,
  ) {}

  async terminateJob(jobUid: Uid<'job'>): Promise<void> {
    this.logger.log(`Terminating job ${jobUid} via CLI`)

    const job = await this.jobService.getEditableEntityByUid(jobUid)

    if (!job) {
      throw new NotFoundError(`Job with UID:${jobUid} not found or not accessible`)
    }

    await this.jobSynchronizationService.requestTerminateJob(job.dxid)
  }
}
