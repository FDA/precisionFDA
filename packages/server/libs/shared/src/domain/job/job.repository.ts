import { FilterQuery } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { Job } from './job.entity'

export class JobRepository extends AccessControlRepository<Job> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Job>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

    return {
      $or: [{ user: user.id, scope: STATIC_SCOPE.PRIVATE }, { scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Job>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map(space => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }

  async findAllRunningJobs(): Promise<Job[]> {
    return await this.find(
      {
        $or: [
          { state: JOB_STATE.IDLE },
          { state: JOB_STATE.RUNNING },
          { state: JOB_STATE.RUNNABLE },
          { state: JOB_STATE.TERMINATING },
        ],
      },
      { populate: ['user'] },
    )
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
