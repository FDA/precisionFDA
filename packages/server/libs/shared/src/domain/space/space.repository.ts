import { FilterQuery } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { CountStats } from '@shared/database/statistics.type'
import { User } from '@shared/domain/user/user.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { Space } from './space.entity'

export class SpaceRepository extends AccessControlRepository<Space> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Space>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      spaceMemberships: {
        user: user.id,
        active: true,
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Space>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      spaceMemberships: {
        user: user.id,
        active: true,
        role: {
          $in: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD, SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR],
        },
      },
    }
  }

  async findSpacesByIdAndUser(spaceIds: number[], userId: number): Promise<Space[]> {
    const qb = this.em.createQueryBuilder(Space, 'space')
    qb.select('space.*')
      .join('spaceMemberships', 'sm')
      .where({ 'space.id': spaceIds })
      .andWhere({ 'sm.user_id': userId })
    return await qb.execute()
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
    FROM spaces
    WHERE state != 3 -- Exclude deleted spaces
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
