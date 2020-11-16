import { EntityRepository } from '@mikro-orm/core'
import { Job } from './job.entity'

export class JobRepository extends EntityRepository<Job> {
  async findPaginated(input: { page: number; limit: number }): Promise<[Job[], number]> {
    // return with users and apps
    const { page, limit } = input
    const offset = (page - 1) * limit
    // test how smart pagination is with the references
    const [jobs, count] = await this.findAndCount(
      {},
      {
        populate: ['app', 'user', 'taggings.tag'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    )
    return [jobs, count]
  }
}
