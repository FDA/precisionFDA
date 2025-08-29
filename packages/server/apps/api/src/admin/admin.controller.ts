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
import { User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/user.service'
import { ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { Job } from 'bull'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'
import { UserRepository } from '@shared/domain/user/user.repository'
import { config } from '@shared/config'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceGroupDTO } from '@shared/domain/space/dto/space-group.dto'
import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'
import { LimitAdminRequestDTO } from '@shared/domain/admin/dto/limit-admin-request.dto'
import { ResourceAdminRequestDTO } from '@shared/domain/admin/dto/resource-admin-request.dto'

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
    private readonly spaceService: SpaceService,
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

  @HttpCode(204)
  @Put('/users/set-total-limit')
  async setUsersTotalLimit(@Body() body: LimitAdminRequestDTO): Promise<string> {
    const { ids, limit } = body
    await this.userRepo.bulkUpdateSetTotalLimit(ids, limit)

    return 'updated'
  }

  @HttpCode(204)
  @Put('/users/set-job-limit')
  async setUsersJobLimit(@Body() body: LimitAdminRequestDTO): Promise<string> {
    const { ids, limit } = body
    await this.userRepo.bulkUpdateSetJobLimit(ids, limit)

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
    return this.invitationService.provisionUsers(body)
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
  async resetUsers2fa(@Body() body: AdminRequestDTO): Promise<
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
  async unlockUsers(@Body() body: AdminRequestDTO): Promise<
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

    return await this.userRepo.bulkUpdateUnlock(ids, this.adminClient, this.user)
  }

  @Put('/users/activate')
  async activateUsers(@Body() body: AdminRequestDTO): Promise<string> {
    const { ids } = body

    // validate that user is not trying to activate themselves
    if (ids.includes(this.user.id)) {
      throw new ValidationError('Cannot activate self')
    }
    await this.userRepo.bulkActivate(ids)

    return 'updated'
  }

  @Put('/users/deactivate')
  async deactivateUsers(@Body() body: AdminRequestDTO): Promise<string> {
    const { ids } = body

    // validate that user is not trying to deactivate themselves
    if (ids.includes(this.user.id)) {
      throw new ValidationError('Cannot deactivate self')
    }
    await this.userRepo.bulkDeactivate(ids)

    return 'updated'
  }

  @Put('/users/enable-resource')
  async enableResourceTypeForUsers(@Body() body: ResourceAdminRequestDTO): Promise<string> {
    const { ids, resource } = body
    await this.userRepo.bulkEnableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/enable-all-resources')
  async enableAllResourceTypesForUsers(@Body() body: AdminRequestDTO): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkEnableAll(ids)

    return 'updated'
  }

  @Put('/users/disable-resource')
  async disableResourceTypeForUsers(@Body() body: ResourceAdminRequestDTO): Promise<string> {
    const { ids, resource } = body
    await this.userRepo.bulkDisableResourceType(ids, resource)

    return 'updated'
  }

  @Put('/users/disable-all-resources')
  async disableAllResourceTypesForUsers(@Body() body: AdminRequestDTO): Promise<string> {
    const { ids } = body
    await this.userRepo.bulkDisableAll(ids)

    return 'updated'
  }

  @Get('/fda-space-group')
  async getFDASpaceGroup(): Promise<SpaceGroupDTO> {
    const fdaSpaceGroupID = config.defaultFDASpaceGroupId
    if (!fdaSpaceGroupID) return null
    return await this.spaceService.getSpaceGroupById(fdaSpaceGroupID)
  }
}

// TODO(samuel)
// S.Westreich - deactivate button - bulk behaviour
// * Refactor deactivate users modal into react
