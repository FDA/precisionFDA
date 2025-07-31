import { FilterQuery } from '@mikro-orm/mysql'
import { PaginationParams } from '../../types/common'
import { buildEntityQueryAndFilter } from '../permissions/permissions.filters'
import { Job } from './job.entity'
import { JOB_STATE } from './job.enum'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

// Either find by spaceId or userId
interface JobsFindPaginatedParams extends PaginationParams {
  spaceId?: number
  userId?: number
}

export class JobRepository extends AccessControlRepository<Job> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Job>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Job>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }
  async findPaginated(input: JobsFindPaginatedParams): Promise<[Job[], number]> {
    // return with users and apps
    const { page, limit } = input
    const offset = (page - 1) * limit
    const [query, filters] = buildEntityQueryAndFilter(input)
    // test how smart pagination is with the references
    // N.B. Prefer to populate joins outside this call to make the code cleaner
    //      e.g. await em.populate(jobs, ['app', 'user'])
    const [jobs, count] = await this.findAndCount(query, {
      filters: filters,
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
      fields: ['id', 'dxid', 'entityType', 'name', 'scope', 'state'],
    })
    return [jobs as Job[], count]
  }

  async findAllRunningJobs(): Promise<Job[]> {
    return await this.find({
      $or: [
        { state: JOB_STATE.IDLE },
        { state: JOB_STATE.RUNNING },
        { state: JOB_STATE.RUNNABLE },
        { state: JOB_STATE.TERMINATING },
      ],
    })
  }

  async findRunningJobsByUser(input: { userId: number }): Promise<Job[]> {
    return await this.find(
      {
        $or: [
          { state: JOB_STATE.IDLE },
          { state: JOB_STATE.RUNNING },
          { state: JOB_STATE.RUNNABLE },
          { state: JOB_STATE.TERMINATING },
        ],
      },
      {
        filters: {
          ownedBy: { userId: input.userId },
        },
      },
    )
  }
}
