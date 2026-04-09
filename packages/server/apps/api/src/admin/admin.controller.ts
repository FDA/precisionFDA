import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { config } from '@shared/config'
import { CountStats } from '@shared/database/statistics.type'
import { AdminRequestDTO } from '@shared/domain/admin/dto/admin-request.dto'
import { LimitAdminRequestDTO } from '@shared/domain/admin/dto/limit-admin-request.dto'
import { ResourceAdminRequestDTO } from '@shared/domain/admin/dto/resource-admin-request.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { EditInvitationDTO } from '@shared/domain/invitation/dto/edit-invitation.dto'
import { InvitationPaginationDTO } from '@shared/domain/invitation/dto/invitation-pagination.dto'
import { ProvisionUsersDTO } from '@shared/domain/invitation/dto/provision-users.dto'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { InvitationService } from '@shared/domain/invitation/services/invitation.service'
import { SpaceGroupDTO } from '@shared/domain/space/dto/space-group.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserManagementService } from '@shared/domain/user/service/user-management.service'
import { User } from '@shared/domain/user/user.entity'
import { JobStaleCheckFacade } from '@shared/facade/job/job-stale-check.facade'
import { StatisticsFacade } from '../facade/statistics/statistics.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'

@UseGuards(UserContextGuard, SiteAdminGuard)
@Controller('/admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly invitationService: InvitationService,
    private readonly userManagementService: UserManagementService,
    private readonly spaceService: SpaceService,
    private readonly statisticsFacade: StatisticsFacade,
    private readonly jobStaleCheckFacade: JobStaleCheckFacade,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000) // cache for 60 seconds
  @Get('/stats')
  async getStats(): Promise<{
    usersCount: CountStats
    spacesCount: CountStats
    filesCount: CountStats
    orgsCount: number
  }> {
    return await this.statisticsFacade.getStatistics()
  }

  @HttpCode(204)
  @Get('/check-stale-jobs')
  async checkStaleJobs(): Promise<void> {
    await this.jobStaleCheckFacade.checkAndNotifyStaleJobs()
  }

  @Get('/users')
  async getUsers(@Query() query: UserPaginationDto): Promise<PaginatedResult<User>> {
    return this.userService.paginateUsers(query)
  }

  @Get('/users/pending')
  async getPendingUsers(@Query() query: UserPaginationDto): Promise<PaginatedResult<User>> {
    return this.userManagementService.paginatePendingUsers(query)
  }

  @HttpCode(204)
  @Put('/users/total-limit')
  async setUsersTotalLimit(@Body() body: LimitAdminRequestDTO): Promise<void> {
    const { ids, limit } = body
    await this.userManagementService.bulkUpdateTotalLimit(ids, limit)
  }

  @HttpCode(204)
  @Put('/users/job-limit')
  async setUsersJobLimit(@Body() body: LimitAdminRequestDTO): Promise<void> {
    const { ids, limit } = body
    await this.userManagementService.bulkUpdateJobLimit(ids, limit)
  }

  @Get('/invitations')
  async getInvitations(@Query() query: InvitationPaginationDTO): Promise<PaginatedResult<Invitation>> {
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

  @HttpCode(204)
  @Post('/users/:id/resetMfa')
  async resetUsers2fa(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userManagementService.resetUserMfa(id)
  }

  @HttpCode(204)
  @Post('/users/:id/unlock')
  async unlockUsers(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userManagementService.unlockUserAccount(id)
  }

  @HttpCode(204)
  @Post('/users/:id/resend-activation-email')
  async resendActivationEmail(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userManagementService.resendActivationEmail(id)
  }

  @HttpCode(204)
  @Put('/users/activate')
  async activateUsers(@Body() body: AdminRequestDTO): Promise<void> {
    const { ids } = body
    await this.userManagementService.activateUsers(ids)
  }

  @HttpCode(204)
  @Put('/users/deactivate')
  async deactivateUsers(@Body() body: AdminRequestDTO): Promise<void> {
    const { ids } = body
    await this.userManagementService.deactivateUsers(ids)
  }

  @HttpCode(204)
  @Put('/users/enable-resource')
  async enableResourceTypeForUsers(@Body() body: ResourceAdminRequestDTO): Promise<void> {
    const { ids, resource } = body
    await this.userManagementService.enableResourceType(ids, resource)
  }

  @HttpCode(204)
  @Put('/users/enable-all-resources')
  async enableAllResourceTypesForUsers(@Body() body: AdminRequestDTO): Promise<void> {
    const { ids } = body
    await this.userManagementService.enableAllResources(ids)
  }

  @HttpCode(204)
  @Put('/users/disable-resource')
  async disableResourceTypeForUsers(@Body() body: ResourceAdminRequestDTO): Promise<void> {
    const { ids, resource } = body
    await this.userManagementService.disableResourceType(ids, resource)
  }

  @HttpCode(204)
  @Put('/users/disable-all-resources')
  async disableAllResourceTypesForUsers(@Body() body: AdminRequestDTO): Promise<void> {
    const { ids } = body
    await this.userManagementService.disableAllResources(ids)
  }

  @Get('/fda-space-group')
  async getFDASpaceGroup(): Promise<SpaceGroupDTO> {
    const fdaSpaceGroupID = config.defaultFDASpaceGroupId
    if (!fdaSpaceGroupID) return null
    return await this.spaceService.getSpaceGroupById(fdaSpaceGroupID)
  }
}
