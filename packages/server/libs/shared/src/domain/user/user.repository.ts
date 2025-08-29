import { FindOptions, raw } from '@mikro-orm/core'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { config } from '../../config'
import { DNANEXUS_INVALID_EMAIL, ORG_EVERYONE } from '../../config/consts'
import { MfaAlreadyResetError, ValidationError } from '../../errors'
import { PlatformClient } from '../../platform-client'
import { UserCtx } from '../../types'
import { classifyErrorTypes } from '../../utils/classify-error-types'
import { RESOURCE_TYPES, User, USER_STATE } from './user.entity'

type Resource = (typeof RESOURCE_TYPES)[number]

export class UserRepository extends PaginatedRepository<User> {
  findChallengeBot(): Promise<User> {
    return this.findOneOrFail({
      dxuser: config.platform.challengeBotUser,
    })
  }

  findActive(findOptions?: FindOptions<User>): Promise<User[]> {
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
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.total_limit', ?)`, [
          totalLimit,
        ]),
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
        cloudResourceSettings: raw(`JSON_SET(cloud_resource_settings, '$.job_limit', ?)`, [
          jobLimit,
        ]),
        updatedAt: new Date(),
      })
      .where({
        id: { $in: ids },
      })
      .execute()
  }

  // TODO - Refactor business logic to service layer instead of using repository
  async bulkUpdateReset2fa(
    ids: number[],
    client: PlatformClient,
    userCtx: UserCtx,
  ): Promise<
    {
      dxuser: string
      result:
        | {
            status: 'success'
            value: unknown
            errorType?: undefined
            message?: undefined
            error?: undefined
          }
        | {}
    }[]
  > {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })

    const results = await Promise.allSettled(
      users.map((user) =>
        client.userResetMfa({
          dxid: `user-${userCtx.dxuser}`,
          data: {
            user_id: user.dxuser,
            org_id: ORG_EVERYONE,
          },
        }),
      ),
    )
    return results.map((result, index) => ({
      dxuser: users[index].dxuser,
      result: classifyErrorTypes([MfaAlreadyResetError], result),
    }))
  }

  async bulkUpdateUnlock(
    ids: number[],
    client: PlatformClient,
    userCtx: UserCtx,
  ): Promise<
    {
      dxuser: string
      result: {
        status: 'success' | 'unhandledError' | 'handledError'
        value?: unknown
        errorType?: undefined
        message?: undefined
        error?: undefined
      }
    }[]
  > {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    return Promise.allSettled(
      users.map((user) =>
        client.userUnlock({
          dxid: `user-${userCtx.dxuser}`,
          data: {
            user_id: user.dxuser,
            org_id: ORG_EVERYONE,
          },
        }),
      ),
    ).then((results) =>
      results.map((result, index) => ({
        dxuser: users[index].dxuser,
        result: classifyErrorTypes([], result),
      })),
    )
  }

  // NOTE(samuel) this assumes that user isn't activating self
  async bulkActivate(ids: number[]): Promise<void> {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    const invalidUsers = users.filter((user) => user.userState !== USER_STATE.DEACTIVATED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(
        `Cannot activate other than deactivated users: "${JSON.stringify(
          users.map((user) => user.dxuser),
        )}"`,
      )
    }
    users.forEach((user) => {
      user.disableMessage = null
      if (user.email) {
        user.email = Buffer.from(
          user.email.replace(DNANEXUS_INVALID_EMAIL, '\n'),
          'base64',
        ).toString('utf8')
      }
      if (user.normalizedEmail) {
        user.normalizedEmail = Buffer.from(
          user.normalizedEmail.replace(DNANEXUS_INVALID_EMAIL, '\n'),
          'base64',
        ).toString('utf8')
      }
      user.userState = USER_STATE.ENABLED
      this.em.persist(user)
    })
    return this.em.flush()
  }

  async bulkDeactivate(ids: number[]): Promise<void> {
    const users = await this.em.find(User, {
      id: { $in: ids },
    })

    const invalidUsers = users.filter((user) => user.userState !== USER_STATE.ENABLED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(
        `Cannot deactivate non-enabled users: ${invalidUsers.map((user) => user.dxuser).join(', ')}`,
      )
    }

    const encodeEmail = (email: string): string =>
      Buffer.from(email, 'utf8').toString('base64').replace('\n', '') + DNANEXUS_INVALID_EMAIL

    users.forEach((user) => {
      user.disableMessage = 'Deactivated by admin'
      user.userState = USER_STATE.DEACTIVATED

      if (user.email) {
        user.email = encodeEmail(user.email)
      }
      if (user.normalizedEmail) {
        user.normalizedEmail = encodeEmail(user.normalizedEmail)
      }

      this.em.persist(user)
    })

    await this.em.flush()
  }

  async bulkEnableResourceType(ids: number[], resource: Resource): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(`JSON_ARRAY_APPEND(cloud_resource_settings, '$.resources', ?)`, [
          resource,
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

  async bulkEnableAll(ids: number[]): Promise<void> {
    // Convert RESOURCE_TYPES array to a JSON array string for MySQL
    const resourcesJson = JSON.stringify(RESOURCE_TYPES)

    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(
          `JSON_SET(cloud_resource_settings, '$.resources', CAST(? AS JSON))`,
          [resourcesJson],
        ),
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

    users.forEach((user) => {
      if (user.cloudResourceSettings?.resources) {
        user.cloudResourceSettings.resources = user.cloudResourceSettings.resources.filter(
          (userResource) => userResource !== resource,
        )
      }
      this.em.persist(user)
    })

    await this.em.flush()
  }

  async bulkDisableAll(ids: number[]): Promise<void> {
    await this.createQueryBuilder()
      .update({
        cloudResourceSettings: raw(
          `JSON_SET(cloud_resource_settings, '$.resources', JSON_ARRAY())`,
        ),
        updatedAt: new Date(),
      })
      .where({
        id: {
          $in: ids,
        },
      })
      .execute()
  }
}
