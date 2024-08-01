import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { config } from '@shared/config'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { RESOURCE_TYPES, User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { buildFiltersWithColumnNodes } from '@shared/utils/filters'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'
import { getAdminBodyValidationPipe } from './pipes/admin-body-validation.pipe'
import { AdminUsersPaginationPipe } from './pipes/admin-users-pagination.pipe'
import { enumValidator, numericBodyValidator } from './possibly-reusable-things'
import { Organization } from '@shared/domain/org/org.entity'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'

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

type Resource = (typeof RESOURCE_TYPES)[number]

interface IResourceTypeParams {
  ids: number[]
  resource: Resource
}

@UseGuards(UserContextGuard, SiteAdminGuard)
@Controller('/admin')
export class AdminController {
  constructor(
    private readonly user: UserContext,
    private readonly logger: Logger,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly maintenanceJobProducer: MaintenanceQueueJobProducer,
  ) {}

  @Get('/stats')
  async getStats() {
    const usersCount = await this.em.getRepository(User).count()
    const orgsCount = await this.em.getRepository(Organization).count()
    return { usersCount, orgsCount }
  }

  /**
   * Currently unused in app. Needs to be invoked by outside HTTP request.
   */
  @Get('/checkStaleJobs')
  async checkStaleJobs() {
    return await this.maintenanceJobProducer.createCheckStaleJobsTask(this.user)
  }

  @Get('/users')
  async getUsers(@Query(AdminUsersPaginationPipe) pagination: any) {
    const { orderBy, filters } = pagination
    // TODO simplify this craziness
    const res =
      orderBy === 'totalLimit' ||
      orderBy === 'jobLimit' ||
      Boolean(filters.totalLimit) ||
      Boolean(filters.jobLimit)
        ? await this.em.getRepository(User).findPaginatedWithJsonFields({
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
            filters: buildFiltersWithColumnNodes(filters, {
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
        : await this.em.getRepository(User).findPaginated({
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
    await this.em.getRepository(User).bulkUpdateSetTotalLimit(ids, totalLimit)

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
    await this.em.getRepository(User).bulkUpdateSetJobLimit(ids, jobLimit)

    return 'updated'
  }

  @HttpCode(200)
  @Post('/users/reset2fa')
  async resetUsers2fa(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    const adminUserClient = new PlatformClient(
      { accessToken: config.platform.adminUserAccessToken },
      this.logger,
    )
    const results = await this.em
      .getRepository(User)
      .bulkUpdateReset2fa(ids, adminUserClient, this.user)

    return results
  }

  @HttpCode(200)
  @Post('/users/unlock')
  async unlockUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    const adminUserClient = new PlatformClient(
      { accessToken: config.platform.adminUserAccessToken },
      this.logger,
    )
    const results = await this.em
      .getRepository(User)
      .bulkUpdateUnlock(ids, adminUserClient, this.user)

    if (results.some(({ result }) => result.status === 'unhandledError')) {
      throw new ValidationError(undefined, { details: results })
    }

    return results
  }

  @Put('/users/activate')
  async activateUsers(
    @Body(
      getAdminBodyValidationPipe({
        ids: (value: number[], _: string, user: UserContext) => {
          if (value.includes(user.id)) {
            throw new ValidationError('Cannot activate self')
          }
        },
      }),
    )
    body: IIdListParams,
  ) {
    const { ids } = body
    await this.em.getRepository(User).bulkActivate(ids)

    return 'updated'
  }

  @Put('/users/deactivate')
  async deactivateUsers(
    @Body(
      getAdminBodyValidationPipe({
        ids: (value: number[], _: string, user: UserContext) => {
          if (value.includes(user.id)) {
            throw new ValidationError('Cannot deactivate self')
          }
        },
      }),
    )
    body: IIdListParams,
  ) {
    const { ids } = body
    await this.em.getRepository(User).bulkDeactivate(ids)

    return 'updated'
  }

  @Put('/users/enableResourceType')
  async enableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(RESOURCE_TYPES as any as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ) {
    const { ids, resource } = body
    await this.em.getRepository(User).bulkEnableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/enableAllResourceTypes')
  async enableAllResourceTypesForUsers(
    @Body(getAdminBodyValidationPipe()) body: IResourceTypeParams,
  ) {
    const { ids } = body
    await this.em.getRepository(User).bulkEnableAll(ids)

    return 'updated'
  }

  @Put('/users/disableResourceType')
  async disableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(RESOURCE_TYPES as any as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ) {
    const { ids, resource } = body
    await this.em.getRepository(User).bulkDisableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/disableAllResourceTypes')
  async disableAllResourceTypesForUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body
    await this.em.getRepository(User).bulkDisableAll(ids)

    return 'updated'
  }
}

// TODO(samuel)
// S.Westreich - deactivate button - bulk behaviour
// * Refactor deactivate users modal into react
