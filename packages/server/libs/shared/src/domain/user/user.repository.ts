import { FindOptions, raw } from '@mikro-orm/core'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { CountStats } from '@shared/database/statistics.type'
import { config } from '../../config'
import { RESOURCE_TYPES, Resource, User } from './user.entity'

export class UserRepository extends PaginatedRepository<User> {
  findChallengeBot(): Promise<User> {
    return this.findOneOrFail({
      dxuser: config.platform.challengeBotUser,
    })
  }

  findActive<Hint extends string = never>(findOptions?: FindOptions<User, Hint>): Promise<User[]> {
    return this.find({ lastLogin: { $ne: null }, privateFilesProject: { $ne: null } }, findOptions)
  }

  findDxuser(dxuser: string): Promise<User> {
    return this.findOneOrFail({ dxuser }, { populate: ['organization'] })
  }

  /** @deprecated This should never be used, causes the checkNonTerminatedDbClusters to fail in prod */
  findAdminUser(): Promise<User> {
    return this.findDxuser(config.platform.adminUser)
  }

  async bulkUpdateSetTotalLimit(ids: number[], totalLimit: number): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.total_limit', ?)`, [totalLimit]),
        updatedAt: new Date(),
      })
      .where({
        id: { $in: ids },
      })
      .execute()
  }

  async bulkUpdateSetJobLimit(ids: number[], jobLimit: number): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.job_limit', ?)`, [jobLimit]),
        updatedAt: new Date(),
      })
      .where({
        id: { $in: ids },
      })
      .execute()
  }

  async bulkEnableResourceType(ids: number[], resource: Resource): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_ARRAY_APPEND(cloud_resource_settings, '$.resources', ?)`, [resource]),
        updatedAt: new Date(),
      })
      .where({
        id: {
          $in: ids,
        },
      })
      .execute()
  }

  async bulkEnableAllResources(ids: number[]): Promise<void> {
    // Convert RESOURCE_TYPES array to a JSON array string for MySQL
    const resourcesJson = JSON.stringify(RESOURCE_TYPES)

    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.resources', CAST(? AS JSON))`, [
          resourcesJson,
        ]),
        updatedAt: new Date(),
      })
      .where({
        id: {
          $in: ids,
        },
      })
      .execute()
  }

  async bulkDisableResourceType(ids: number[], resource: Resource): Promise<void> {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })

    users.forEach(user => {
      if (user.cloudResourceSettings?.resources) {
        user.cloudResourceSettings.resources = user.cloudResourceSettings.resources.filter(
          userResource => userResource !== resource,
        )
      }
      this.em.persist(user)
    })

    await this.em.flush()
  }

  async bulkDisableAllResources(ids: number[]): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.resources', JSON_ARRAY())`),
        updatedAt: new Date(),
      })
      .where({
        id: {
          $in: ids,
        },
      })
      .execute()
  }

  async getStatistics(): Promise<CountStats> {
    const now = new Date()

    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const yearToDateStart = new Date(now.getFullYear(), 0, 1)

    const result = await this.em.getConnection().execute(
      `
        SELECT COUNT(*)                                         as total,
               SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_month,
               SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_six_months,
               SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as year_to_date,
               SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as last_year
        FROM users
        WHERE user_state = 0 -- Only active users
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
