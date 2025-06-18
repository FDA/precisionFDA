import { JobService } from '@shared/domain/job/job.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Injectable } from '@nestjs/common'
import { EntityScope } from '@shared/types/common'

@Injectable()
export class CliJobScopeFacade {
  constructor(private readonly jobService: JobService) {}

  async getJobScope(jobDxid: DxId<'job'>): Promise<{ scope: EntityScope }> {
    const job = await this.jobService.findAccessible(jobDxid)
    return { scope: job.scope }
  }
}
