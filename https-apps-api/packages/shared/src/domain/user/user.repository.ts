import { FindOptions } from '@mikro-orm/core'
import { config } from '../../config'
import { User } from '..'
import { PaginatedEntityRepository } from '../../database/paginated-repository'
import { buildJsonPath } from '../../utils/path'
import { mysqlJsonArrayAppend, mysqlJsonSet } from '../../utils/sql-json-column-utils'
import { DNANEXUS_INVALID_EMAIL, ORG_EVERYONE } from '../../config/consts'
import { PlatformClient } from '../../platform-client'
import { UserCtx } from '../../types'
import { MfaAlreadyResetError, ValidationError } from '../../errors'
import { classifyErrorTypes } from '../../utils/classify-error-types'
import { RESOURCE_TYPES, USER_STATE } from './user.entity'

type Resource = (typeof RESOURCE_TYPES)[number]

export class UserRepository extends PaginatedEntityRepository<User> {
  protected getEntityKey(): string {
    return 'users'
  }

  findWithEmailSettings(userIds: number[]) {
    return this.find(
      {
        id: { $in: userIds },
      },
      { populate: ['notificationPreference'] },
    )
  }

  findActive(findOptions?: FindOptions<User>) {
    return this.find(
      { lastLogin: { $ne: null }, privateFilesProject: { $ne: null } },
      findOptions,
    )
  }

  findDxuser(dxuser: string): Promise<User> {
    return this.findOneOrFail({ dxuser })
  }

  findAdminUser(): Promise<User> {
    return this.findDxuser(config.platform.adminUser)
  }

  findChallengeBotUser(): Promise<User> {
    return this.findDxuser(config.platform.challengeBotUser)
  }

  bulkUpdateSetTotalLimit(
    ids: number[],
    totalLimit: number,
  ) {
    const qb = this.createQueryBuilder()
    qb.where({ id: {
      $in: ids,
    } })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(mysqlJsonSet<User>(
        // TODO(samuel) resolve snake_case to camelCase mapping
        'cloud_resource_settings' as any,
        buildJsonPath(['total_limit']),
        { type: 'number', value: totalLimit },
      )),
    })
    return this.em.getConnection().execute(knexQuery)
  }

  bulkUpdateSetJobLimit(
    ids: number[],
    jobLimit: number,
  ) {
    const qb = this.createQueryBuilder()
    qb.where({ id: {
      $in: ids,
    } })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(mysqlJsonSet<User>(
        // TODO(samuel) resolve snake_case to camelCase mapping
        'cloud_resource_settings' as any,
        buildJsonPath(['job_limit']),
        { type: 'number', value: jobLimit },
      )),
    })
    return this.em.getConnection().execute(knexQuery)
  }

  // TODO - Refactor business logic to service layer instead of using repository
  async bulkUpdateReset2fa(ids: number[], client: PlatformClient, userCtx: UserCtx) {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })

    return Promise.allSettled(users.map(user => client.userResetMfa({
      dxid: `user-${userCtx.dxuser}`,
      data: {
        user_id: user.dxuser,
        org_id: ORG_EVERYONE,
      },
    }))).then(results => results.map((result, index) => ({
      dxuser: users[index].dxuser,
      result: classifyErrorTypes([MfaAlreadyResetError], result),
    })))
  }

  async bulkUpdateUnlock(ids: number[], client: PlatformClient, userCtx: UserCtx) {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    return Promise.allSettled(users.map(user => client.userUnlock({
      dxid: `user-${userCtx.dxuser}`,
      data: {
        user_id: user.dxuser,
        org_id: ORG_EVERYONE,
      },
    }))).then(results => results.map((result, index) => ({
      dxuser: users[index].dxuser,
      result: classifyErrorTypes([], result),
    })))
  }

  // NOTE(samuel) this assumes that user isn't activating self
  async bulkActivate(ids: number[]) {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    const invalidUsers = users.filter(user => user.userState !== USER_STATE.DEACTIVATED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(`Cannot activate other than deactivated users: "${
        JSON.stringify(users.map(user => user.dxuser))
      }"`)
    }
    users.forEach(user => {
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
  async bulkDeactivate(ids: number[]) {
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    const invalidUsers = users.filter(user => user.userState !== USER_STATE.ENABLED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(`Cannot deactivate other than enabled users: "${
        JSON.stringify(users.map(user => user.dxuser))
      }"`)
    }
    users.forEach(user => {
      // TODO(samuel) - placeholder
      user.disableMessage = 'Bulk deactivate'
      if (user.email) {
        user.email = Buffer.from(
          user.email,
          'utf8',
        ).toString('base64').replace('\n', '') + DNANEXUS_INVALID_EMAIL
      }
      if (user.normalizedEmail) {
        user.normalizedEmail = Buffer.from(
          user.normalizedEmail,
          'utf8',
        ).toString('base64').replace('\n', '') + DNANEXUS_INVALID_EMAIL
      }
      user.userState = USER_STATE.DEACTIVATED
      this.em.persist(user)
    })
    await this.em.flush()
  }

  bulkEnableResourceType(
    ids: number[],
    resource: Resource,
  ) {
    const qb = this.em.createQueryBuilder(User)
    qb.where({ id: {
      $in: ids,
    } })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(mysqlJsonArrayAppend<User>(
        // TODO(samuel) resolve snake_case to camelCase mapping
        'cloud_resource_settings' as any,
        buildJsonPath(['resources']),
        { type: 'string', value: resource },
      )),
    })
    return this.em.getConnection().execute(knexQuery)
  }

  bulkEnableAll(ids: number[]) {
    const qb = this.createQueryBuilder()
    qb.where({ id: {
      $in: ids,
    } })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(mysqlJsonSet<User>(
        // TODO(samuel) resolve snake_case to camelCase mapping
        'cloud_resource_settings' as any,
        buildJsonPath(['resources']),
        { type: 'jsonArrayExpression', value: RESOURCE_TYPES.map((v) => ({ type: 'string', value: v })) },
      )),
    })
    return this.em.getConnection().execute(knexQuery)
  }

  async bulkDisableResourceType(
    ids: number[],
    resource: Resource,
  ) {
    // NOTE(samuel) impossible to implement with knex query and JSON mysql functions
    // JSON functions cannot filter element out of an array
    const users = await this.em.find(User, {
      id: {
        $in: ids,
      },
    })
    users.forEach(user => {
      user.cloudResourceSettings!.resources = user.cloudResourceSettings!.resources.filter(userResource => userResource !== resource)
      this.em.persist(user)
    })
    return this.em.flush()
  }

  bulkDisableAll(ids: number[]) {
    const qb = this.createQueryBuilder()
    qb.where({ id: {
      $in: ids,
    } })
    // NOTE(samuel) mikro-orm is using outdated query builder
    // and its own query resolves JSON_SET as string, instead of mysql function
    const knex = this.em.getConnection().getKnex()
    const knexQuery = qb.getKnexQuery()
    knexQuery.update({
      cloud_resource_settings: knex.raw(mysqlJsonSet<User>(
        // TODO(samuel) resolve snake_case to camelCase mapping
        'cloud_resource_settings' as any,
        buildJsonPath(['resources']),
        { type: 'jsonArrayExpression', value: [] },
      )),
    })
    return this.em.getConnection().execute(knexQuery)
  }
}

