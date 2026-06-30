import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import { AdminMembershipPaginationDTO } from '@shared/domain/admin-membership/dto/admin-membership-pagination.dto'
import { ChallengeLeadsDTO } from '@shared/domain/admin-membership/dto/challenge-leads.dto'
import { CreateAdminMembershipDTO } from '@shared/domain/admin-membership/dto/create-admin-membership.dto'
import { UserWithAdminRolesDTO } from '@shared/domain/admin-membership/dto/user-with-admin-roles.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { AdminMembershipsListFacade } from '@shared/facade/admin-membership/admin-memberships-list.facade'
import { CreateAdminMembershipFacade } from '@shared/facade/admin-membership/create-admin-membership.facade'
import { RemoveAdminMembershipFacade } from '@shared/facade/admin-membership/remove-admin-membership.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { ChallengeOrSiteAdminGuard } from './guards/challenge-or-site-admin.guard'
import { SiteAdminGuard } from './guards/site-admin.guard'

@UseGuards(UserContextGuard)
@Controller('/admin/memberships')
export class AdminMembershipsController {
  constructor(
    private readonly adminMembershipsListFacade: AdminMembershipsListFacade,
    private readonly createAdminMembershipFacade: CreateAdminMembershipFacade,
    private readonly removeAdminMembershipFacade: RemoveAdminMembershipFacade,
  ) {}

  @UseGuards(ChallengeOrSiteAdminGuard)
  @Get('/challenge-leads')
  async getChallengeLeads(): Promise<ChallengeLeadsDTO> {
    return this.adminMembershipsListFacade.listChallengeLeads()
  }

  @UseGuards(SiteAdminGuard)
  @Get('/users')
  async getUsersWithRoles(
    @Query() query: AdminMembershipPaginationDTO,
  ): Promise<PaginatedResult<UserWithAdminRolesDTO>> {
    return this.adminMembershipsListFacade.listUsersWithRoles(query)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post()
  async createMembership(@Body() body: CreateAdminMembershipDTO): Promise<{ id: number }> {
    return this.createAdminMembershipFacade.createMembership(body)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Delete('/:id')
  async removeMembership(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.removeAdminMembershipFacade.removeMembership(id)
  }
}
