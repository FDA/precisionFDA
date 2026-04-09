import { EntityManager } from '@mikro-orm/core'
import { Job as BullJob } from 'bull'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { CheckStatusJob } from '@shared/queue/task.input'
import { JobHandler } from './job.handler'

class SyncOutputsHandler implements JobHandler<CheckStatusJob> {
  private readonly em: EntityManager
  private readonly jobService: JobService

  constructor(em: EntityManager, jobService: JobService) {
    this.em = em
    this.jobService = jobService
  }

  async handle(bullJob: BullJob<CheckStatusJob>): Promise<void> {
    const jobRepo = this.em.getRepository(Job)
    await jobRepo.findOneOrFail({ dxid: bullJob.data.payload.dxid })
    await this.jobService.syncOutputs(bullJob.data.payload.dxid)
  }
}

export { SyncOutputsHandler }
