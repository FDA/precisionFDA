import { Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { JobService } from '@shared/domain/job/job.service'
import { EntityScope } from '@shared/types/common'

@Injectable()
export class CliJobScopeFacade {
  constructor(private readonly jobService: JobService) {}

  async getJobScope(jobDxid: DxId<'job'>): Promise<{ scope: EntityScope }> {
    const job = await this.jobService.findAccessible(jobDxid)
    return { scope: job.scope }
  }
}
