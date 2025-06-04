import { JobService } from '@shared/domain/job/job.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CliJobScopeFacade {
  constructor(private readonly jobService: JobService) {}

  async getJobScope(jobDxid: DxId<'job'>) {
    const job = await this.jobService.findAccessible(jobDxid)
    return { scope: job.scope }
  }
}
