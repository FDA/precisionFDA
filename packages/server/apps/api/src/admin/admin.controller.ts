import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { RESOURCE_TYPES, User } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'
import { getAdminBodyValidationPipe } from './pipes/admin-body-validation.pipe'
import { enumValidator, numericBodyValidator } from './possibly-reusable-things'
import { Organization } from '@shared/domain/org/org.entity'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { UserService } from '@shared/domain/user/user.service'

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
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    @Inject(ADMIN_PLATFORM_CLIENT) private readonly adminClient: PlatformClient,
    private readonly userService: UserService,
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
  async getUsers(@Query() query: UserPaginationDto) {
    // temporarily override because new paging uses
    // pageSize on backend and the infrastructure
    // on FE uses perPage :-(
    if (query.perPage) {
      query.pageSize = query.perPage
    }

    return this.userService.paginateUsers(query)
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

  /**
   * @DEPRECATED - TO BE REPLACED WITH SINGLE USER RESET 2FA
   * TODO: PFDA-5953
   */
  @HttpCode(200)
  @Post('/users/reset2fa')
  async resetUsers2fa(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body

    const results = await this.em
      .getRepository(User)
      .bulkUpdateReset2fa(ids, this.adminClient, this.user)

    return results
  }

  @HttpCode(200)
  @Post('/users/unlock')
  async unlockUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams) {
    const { ids } = body

    const results = await this.em
      .getRepository(User)
      .bulkUpdateUnlock(ids, this.adminClient, this.user)

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
