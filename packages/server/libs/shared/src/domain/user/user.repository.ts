import { FindOptions } from '@mikro-orm/core'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { config } from '../../config'
import { DNANEXUS_INVALID_EMAIL, ORG_EVERYONE } from '../../config/consts'
import { MfaAlreadyResetError, ValidationError } from '../../errors'
import { PlatformClient } from '../../platform-client'
import { UserCtx } from '../../types'
import { classifyErrorTypes } from '../../utils/classify-error-types'
import { buildJsonPath } from '../../utils/path'
import { mysqlJsonArrayAppend, mysqlJsonSet } from '../../utils/sql-json-column-utils'
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
    const qb = this.createQueryBuilder()
    qb.where({
      id: {
        $in: ids,
      },
    })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(
        mysqlJsonSet<User>(
          // TODO(samuel) resolve snake_case to camelCase mapping
          'cloud_resource_settings' as keyof User,
          buildJsonPath(['total_limit']),
          { type: 'number', value: totalLimit },
        ),
      ),
    })
    await this.em.getConnection().execute(knexQuery)
  }

  async bulkUpdateSetJobLimit(ids: number[], jobLimit: number): Promise<void> {
    const qb = this.createQueryBuilder()
    qb.where({
      id: {
        $in: ids,
      },
    })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(
        mysqlJsonSet<User>(
          // TODO(samuel) resolve snake_case to camelCase mapping
          'cloud_resource_settings' as keyof User,
          buildJsonPath(['job_limit']),
          { type: 'number', value: jobLimit },
        ),
      ),
    })
    await this.em.getConnection().execute(knexQuery)
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

  // Note(samuel) this assumes that user isn't deactivating self
  async bulkDeactivate(ids: number[]): Promise<void> {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    const invalidUsers = users.filter((user) => user.userState !== USER_STATE.ENABLED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(
        `Cannot deactivate other than enabled users: "${JSON.stringify(
          users.map((user) => user.dxuser),
        )}"`,
      )
    }
    users.forEach((user) => {
      // TODO(samuel) - placeholder
      user.disableMessage = 'Bulk deactivate'
      if (user.email) {
        user.email =
          Buffer.from(user.email, 'utf8').toString('base64').replace('\n', '') +
          DNANEXUS_INVALID_EMAIL
      }
      if (user.normalizedEmail) {
        user.normalizedEmail =
          Buffer.from(user.normalizedEmail, 'utf8').toString('base64').replace('\n', '') +
          DNANEXUS_INVALID_EMAIL
      }
      user.userState = USER_STATE.DEACTIVATED
      this.em.persist(user)
    })
    await this.em.flush()
  }

  async bulkEnableResourceType(ids: number[], resource: Resource): Promise<void> {
    const qb = this.em.createQueryBuilder(User)
    qb.where({
      id: {
        $in: ids,
      },
    })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(
        mysqlJsonArrayAppend<User>(
          // TODO(samuel) resolve snake_case to camelCase mapping
          'cloud_resource_settings' as keyof User,
          buildJsonPath(['resources']),
          { type: 'string', value: resource },
        ),
      ),
    })
    await this.em.getConnection().execute(knexQuery)
  }

  async bulkEnableAll(ids: number[]): Promise<void> {
    const qb = this.createQueryBuilder()
    qb.where({
      id: {
        $in: ids,
      },
    })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(
        mysqlJsonSet<User>(
          // TODO(samuel) resolve snake_case to camelCase mapping
          'cloud_resource_settings' as keyof User,
          buildJsonPath(['resources']),
          {
            type: 'jsonArrayExpression',
            value: RESOURCE_TYPES.map((v) => ({ type: 'string', value: v })),
          },
        ),
      ),
    })
    await this.em.getConnection().execute(knexQuery)
  }

  async bulkDisableResourceType(ids: number[], resource: Resource): Promise<void> {
    // NOTE(samuel) impossible to implement with knex query and JSON mysql functions
    // JSON functions cannot filter element out of an array
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    users.forEach((user) => {
      user.cloudResourceSettings!.resources = user.cloudResourceSettings!.resources.filter(
        (userResource) => userResource !== resource,
      )
      this.em.persist(user)
    })
    await this.em.flush()
  }

  async bulkDisableAll(ids: number[]): Promise<void> {
    const qb = this.createQueryBuilder()
    qb.where({
      id: {
        $in: ids,
      },
    })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(
        mysqlJsonSet<User>(
          // TODO(samuel) resolve snake_case to camelCase mapping
          'cloud_resource_settings' as keyof User,
          buildJsonPath(['resources']),
          { type: 'jsonArrayExpression', value: [] },
        ),
      ),
    })
    await this.em.getConnection().execute(knexQuery)
  }
}
