import { BaseOperation } from '../../../utils'
import { Job } from '../job.entity'
import type { ListJobsInput, PageJobs } from '../job.input'

export class ListJobsOperation extends BaseOperation<ListJobsInput, PageJobs> {
  async run(input: ListJobsInput): Promise<PageJobs> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    // appName, launched by?, location?, duration, energy, launched at, tags?
    const [jobs, totalCount] = await jobRepo.findPaginated(input)
    // todo: sync jobs here?
    const results: PageJobs = {
      data: jobs,
      meta: {
        totalCount,
        // todo: compute next/prev page
        currentPage: input.page,
        nextPage: input.page + 1,
        limit: input.limit,
      },
    }
    return await Promise.resolve(results)
  }
}
