import { FilterQuery } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '../../enums'
import { Node } from './node.entity'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Uid } from '@shared/domain/entity/domain/uid'
import { CountStats } from '@shared/database/statistics.type'

export class NodeRepository extends AccessControlRepository<Node> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Node>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }

    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes = accessibleSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins
    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Node>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return null
    }

    const editableSpaces = await user.editableSpaces()
    const spaceScopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: spaceScopes } },
      ],
    }
  }

  /**
   * Loads node if it's accessible by user.
   * User needs to have populated ['spaceMemberships', 'spaceMemberships.spaces']
   *
   * @param user
   * @param uid
   * @param spaceIds
   */
  async loadIfAccessibleByUser(user: User, uid: Uid<'file'>, spaceIds: number[]): Promise<Node> {
    const scopes = spaceIds.map((id) => `space-${id}`)

    return await this.findOne(
      {
        uid: uid,
        $or: [
          { scope: STATIC_SCOPE.PUBLIC },
          { user: user.id, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: (scopes as []) ?? [] } },
        ],
      },
      {},
    )
  }

  async getStatistics(): Promise<CountStats> {
    const now = new Date()

    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const yearToDateStart = new Date(now.getFullYear(), 0, 1)

    const result = await this.em.getConnection().execute(
      `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_month,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_six_months,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as year_to_date,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_year
    FROM nodes
    WHERE sti_type = 'UserFile'
  `,
      [oneMonthAgo, sixMonthsAgo, yearToDateStart, oneYearAgo],
    )

    return {
      total: Number(result[0].total),
      lastMonth: Number(result[0].last_month),
      lastSixMonths: Number(result[0].last_six_months),
      yearToDate: Number(result[0].year_to_date),
      lastYear: Number(result[0].last_year),
    }
  }
}
