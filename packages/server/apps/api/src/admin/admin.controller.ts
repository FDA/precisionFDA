import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { EditInvitationDTO } from '@shared/domain/invitation/dto/edit-invitation.dto'
import { InvitationPaginationDTO } from '@shared/domain/invitation/dto/invitation-pagination.dto'
import { ProvisionUsersDTO } from '@shared/domain/invitation/dto/provision-users.dto'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { InvitationService } from '@shared/domain/invitation/services/invitation.service'
import { Organization } from '@shared/domain/org/org.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { RESOURCE_TYPES, User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/user.service'
import { ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { Job } from 'bull'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'
import { getAdminBodyValidationPipe } from './pipes/admin-body-validation.pipe'
import { enumValidator, numericBodyValidator } from './possibly-reusable-things'
import { UserRepository } from '@shared/domain/user/user.repository'

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
    private readonly invitationService: InvitationService,
    private readonly userRepo: UserRepository,
  ) {}

  @Get('/stats')
  async getStats(): Promise<{ usersCount: number; orgsCount: number }> {
    const usersCount = await this.em.getRepository(User).count()
    const orgsCount = await this.em.getRepository(Organization).count()
    return { usersCount, orgsCount }
  }

  /**
   * Currently unused in app. Needs to be invoked by outside HTTP request.
   */
  @Get('/checkStaleJobs')
  async checkStaleJobs(): Promise<Job> {
    return await this.maintenanceJobProducer.createCheckStaleJobsTask(this.user)
  }

  @Get('/users')
  async getUsers(@Query() query: UserPaginationDto): Promise<PaginatedResult<User>> {
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
  ): Promise<string> {
    const { ids, totalLimit } = body
    await this.userRepo.bulkUpdateSetTotalLimit(ids, totalLimit)

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
  ): Promise<string> {
    const { ids, jobLimit } = body
    await this.userRepo.bulkUpdateSetJobLimit(ids, jobLimit)

    return 'updated'
  }

  @Get('/invitations')
  async getInvitations(
    @Query() query: InvitationPaginationDTO,
  ): Promise<PaginatedResult<Invitation>> {
    return this.invitationService.listInvitations(query)
  }

  @HttpCode(200)
  @Post('/users/provision')
  async provisionUsers(@Body() body: ProvisionUsersDTO): Promise<{
    provisioningIds: number[]
  }> {
    return this.invitationService.provisionUsers(body.ids)
  }

  @HttpCode(200)
  @Put('invitations/:id')
  async editInvitationBasicInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditInvitationDTO,
  ): Promise<{ id: number }> {
    return this.invitationService.editBasicInfo(id, body)
  }

  /**
   * @DEPRECATED - TO BE REPLACED WITH SINGLE USER RESET 2FA
   * TODO: PFDA-5953
   */
  @HttpCode(200)
  @Post('/users/reset2fa')
  async resetUsers2fa(@Body(getAdminBodyValidationPipe()) body: IIdListParams): Promise<
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
    const { ids } = body

    return await this.userRepo.bulkUpdateReset2fa(ids, this.adminClient, this.user)
  }

  @HttpCode(200)
  @Post('/users/unlock')
  async unlockUsers(@Body(getAdminBodyValidationPipe()) body: IIdListParams): Promise<
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
    const { ids } = body

    const results = await this.userRepo.bulkUpdateUnlock(ids, this.adminClient, this.user)

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
  ): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkActivate(ids)

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
  ): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkDeactivate(ids)

    return 'updated'
  }

  @Put('/users/enableResourceType')
  async enableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(RESOURCE_TYPES as unknown as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ): Promise<string> {
    const { ids, resource } = body
    await this.userRepo.bulkEnableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/enableAllResourceTypes')
  async enableAllResourceTypesForUsers(
    @Body(getAdminBodyValidationPipe()) body: IResourceTypeParams,
  ): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkEnableAll(ids)

    return 'updated'
  }

  @Put('/users/disableResourceType')
  async disableResourceTypeForUsers(
    @Body(
      getAdminBodyValidationPipe({
        resource: enumValidator<Resource>(RESOURCE_TYPES as unknown as Resource[]),
      }),
    )
    body: IResourceTypeParams,
  ): Promise<string> {
    const { ids, resource } = body
    await this.userRepo.bulkDisableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/disableAllResourceTypes')
  async disableAllResourceTypesForUsers(
    @Body(getAdminBodyValidationPipe()) body: IIdListParams,
  ): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkDisableAll(ids)

    return 'updated'
  }
}

// TODO(samuel)
// S.Westreich - deactivate button - bulk behaviour
// * Refactor deactivate users modal into react
