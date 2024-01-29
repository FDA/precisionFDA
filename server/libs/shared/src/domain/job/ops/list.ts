import { BaseOperation } from '@shared/utils/base-operation'
import { Job } from '../job.entity'
import type { ListJobsInput, PageJobs } from '../job.input'
import { getSpaceIsAccessibleByContext } from '../../space/space.permissions'
import { UserOpsCtx } from '../../../types'
import { JobRepository } from '../job.repository'

export class ListJobsOperation extends BaseOperation<UserOpsCtx, ListJobsInput, PageJobs> {
  async run(input: ListJobsInput): Promise<PageJobs> {
    const em = this.ctx.em

    if (input.spaceId) {
      await getSpaceIsAccessibleByContext(input.spaceId, this.ctx)
    }

    // Build query taking into account scope and spaceId
    const query = {
      ...input,
      userId: this.ctx.user.id,
      scope: input.scope ?? undefined,
      spaceId: input.spaceId ?? undefined,
    }

    // appName, launched by?, location?, duration, energy, launched at, tags?
    const jobRepo: JobRepository = em.getRepository(Job)
    const [jobs, totalCount] = await jobRepo.findPaginated(query)
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
