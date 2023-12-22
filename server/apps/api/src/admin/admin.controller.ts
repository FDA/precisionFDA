/* eslint-disable multiline-ternary */
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Post, Put, Query, UseGuards } from '@nestjs/common'
import {
  client,
  config,
  DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  errors,
  queue,
  user,
  UserContext,
  utils,
} from '@shared'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'
import { getAdminBodyValidationPipe } from './pipes/admin-body-validation.pipe'
import { AdminUsersPaginationPipe } from './pipes/admin-users-pagination.pipe'
import { enumValidator, numericBodyValidator } from './possibly-reusable-things'

interface ISetTotalLimitParams {
  ids: number[]
  totalLimit: number
}

interface ISetJobLimitParams {
  ids: number[]
  jobLimit: number
}

interface IIdListParams {
  ids: number[]
}

type Resource = (typeof user.RESOURCE_TYPES)[number]

interface IResourceTypeParams {
  ids: number[]
  resource: Resource
}

@UseGuards(UserContextGuard, SiteAdminGuard)
@Controller('/admin')
export class AdminController {
  constructor(
    private readonly user: UserContext,
    private readonly log: Logger,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
  ) {}

  @Get('/checkStaleJobs')
  async checkStaleJobs() {
    return await queue.createCheckStaleJobsTask(this.user)
  }

  @Get('/users')
  async getUsers(@Query(AdminUsersPaginationPipe) pagination: any) {
    const { orderBy, filters } = pagination
    const res =
      orderBy === 'totalLimit' ||
      orderBy === 'jobLimit' ||
      Boolean(filters.totalLimit) ||
      Boolean(filters.jobLimit)
        ? await this.em.getRepository(user.User).findPaginatedWithJsonFields({
            ...pagination,
            ...(function () {
              if (!orderBy) {
                return {} as const
              } else if (orderBy === 'totalLimit' || orderBy === 'jobLimit') {
                return {
                  orderBy: {
                    type: 'json' as const,
                    // TODO(samuel) solve this camelCase vs snake_case issue
                    sqlColumn: 'cloud_resource_settings',
                    path: [
                      {
                        totalLimit: 'total_limit',
                        jobLimit: 'job_limit',
                      }[orderBy],
                    ],
                  },
                }
              }
              return {
                orderBy: {
                  type: 'standard' as const,
                  value: orderBy,
                },
              } as any
              // Note(samuel) added 'as any' because of poor type resolution of conditionals
            })(),
            filters: utils.filters.buildFiltersWithColumnNodes(filters, {
              totalLimit: {
                sqlColumn: 'cloud_resource_settings' as any,
                path: ['total_limit'],
              },
              jobLimit: {
                sqlColumn: 'cloud_resource_settings' as any,
                path: ['job_limit'],
              },
            }),
          })
        : await this.em.getRepository(user.User).findPaginated({
            ...pagination,
            orderBy,
            filters: {
              dxuser: filters.dxuser,
              email: filters.email,
              userState: parseInt(filters.userState, 10),
              // NOTE(samuel) unsafe in terms of type, but somehow it works
              // *vomits
              lastLogin: filters.lastLogin as any,
            },
          })
    return res
  }

  @Put('/users/setTotalLimit')
  async setUsersTotalLimit(
    @Body(
      getAdminBodyValidationPipe({
        totalLimit: numericBodyValidator,
      }),
    )
    body: ISetTotalLimitParams,
  ) {
    const { ids, totalLimit } = body
    await this.em.getRepository(user.User).bulkUpdateSetTotalLimit(ids, totalLimit)

    return 'updated'
  }

  @Put('/users/setJobLimit')
  async setUsersJobLimit(
    @Body(
      getAdminBodyValidationPipe({
        jobLimit: numericBodyValidator,
      }),
    )
    body: ISetJobLimitParams,
  ) {
    const { ids, jobLimit } = body
    await this.em.getRepository(user.User).bulkUpdateSetJobLimit(ids, jobLimit)

    return 'updated'
  }

  @HttpCode(200)
  @Post('/users/reset2fa')
  async resetUsers2fa(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    const adminUserClient = new client.PlatformClient(
      config.platform.adminUserAccessToken,
      this.log,
    )
    const results = await this.em
      .getRepository(user.User)
      .bulkUpdateReset2fa(ids, adminUserClient, this.user)

    return results
  }

  @HttpCode(200)
  @Post('/users/unlock')
  async unlockUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    const adminUserClient = new client.PlatformClient(
      config.platform.adminUserAccessToken,
      this.log,
    )
    const results = await this.em
      .getRepository(user.User)
      .bulkUpdateUnlock(ids, adminUserClient, this.user)

    if (results.some(({ result }) => result.status === 'unhandledError')) {
      throw new errors.ValidationError(undefined, { details: results })
    }

    return results
  }

  @Put('/users/activate')
  async activateUsers(
    @Body(
      getAdminBodyValidationPipe({
        ids: (value: number[], _: string, user: UserContext) => {
          const currentUserId = user.id
          if (value.includes(currentUserId)) {
            throw new errors.ValidationError('Cannot activate self')
          }
        },
      }),
    )
    body: IIdListParams,
  ) {
    const { ids } = body
    await this.em.getRepository(user.User).bulkActivate(ids)

    return 'updated'
  }

  @Put('/users/deactivate')
  async deactivateUsers(
    @Body(
      getAdminBodyValidationPipe({
        ids: (value: number[], _: string, user: UserContext) => {
          const currentUserId = user.id
          if (value.includes(currentUserId)) {
            throw new errors.ValidationError('Cannot deactivate self')
          }
        },
      }),
    )
    body: IIdListParams,
  ) {
    const { ids } = body
    await this.em.getRepository(user.User).bulkDeactivate(ids)

    return 'updated'
  }

  @Put('/users/enableResourceType')
  async enableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(user.RESOURCE_TYPES as any as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ) {
    const { ids, resource } = body
    await this.em.getRepository(user.User).bulkEnableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/enableAllResourceTypes')
  async enableAllResourceTypesForUsers(
    @Body(getAdminBodyValidationPipe()) body: IResourceTypeParams,
  ) {
    const { ids } = body
    await this.em.getRepository(user.User).bulkEnableAll(ids)

    return 'updated'
  }

  @Put('/users/disableResourceType')
  async disableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(user.RESOURCE_TYPES as any as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ) {
    const { ids, resource } = body
    await this.em.getRepository(user.User).bulkDisableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/disableAllResourceTypes')
  async disableAllResourceTypesForUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    await this.em.getRepository(user.User).bulkDisableAll(ids)

    return 'updated'
  }
}

// TODO(samuel)
// S.Westreich - deactivate button - bulk behaviour
// * Refactor deactivate users modal into react
