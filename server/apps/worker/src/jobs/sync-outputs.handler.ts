import { Job as BullJob} from 'bull'
import { CheckStatusJob } from '@shared/queue/task.input'
import { job } from '@shared'
import { JobHandler } from './job.handler'
import { EntityManager } from '@mikro-orm/core'

class SyncOutputsHandler implements JobHandler<CheckStatusJob> {

  private readonly em: EntityManager
  private readonly jobService: job.JobService

  constructor(em: EntityManager, jobService: job.JobService) {
    this.em = em
    this.jobService = jobService
  }

  async handle(bullJob: BullJob<CheckStatusJob>): Promise<void> {
    const jobRepo = this.em.getRepository(job.Job)
    await jobRepo.findOneOrFail({dxid: bullJob.data.payload.dxid})
    await this.jobService.syncOutputs(bullJob.data.payload.dxid, bullJob.data.user.id)
  }
}

export { SyncOutputsHandler }
