import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { SpaceLeadRecoverDTO } from '@shared/domain/space-membership/dto/space-lead-recover.dto'
import { SpaceMemberDTO } from '@shared/domain/space-membership/dto/space-member.dto'
import { UpdateSpaceMembershipDTO } from '@shared/domain/space-membership/dto/update-space-membership.dto'
import { SpaceMembershipListApiFacade } from 'apps/api/src/facade/space-membership/space-membership-list-api.facade'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { SpaceMembershipUpdateApiFacade } from '../facade/space-membership/space-membership-update-api.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/spaces/:spaceId/memberships')
export class SpaceMembershipsController {
  constructor(
    private readonly spaceMembershipUpdateApiFacade: SpaceMembershipUpdateApiFacade,
    private readonly spaceMembershipListApiFacade: SpaceMembershipListApiFacade,
  ) {}

  @Get('/')
  async listMembers(@Param('spaceId', ParseIntPipe) spaceId: number): Promise<SpaceMemberDTO[]> {
    return this.spaceMembershipListApiFacade.listSpaceMembers(spaceId)
  }

  @ApiOperation({ summary: 'Recover space lead for orphaned spaces' })
  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Post('/recover-lead')
  async recoverLead(
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Body() body: SpaceLeadRecoverDTO,
  ): Promise<void> {
    await this.spaceMembershipUpdateApiFacade.recoverLeadByAdmin(spaceId, body)
  }

  @ApiOperation({ summary: 'Bulk update space membership permissions' })
  @HttpCode(204)
  @Patch('/')
  async bulkUpdatePermission(
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Body() body: UpdateSpaceMembershipDTO,
  ): Promise<void> {
    await this.spaceMembershipUpdateApiFacade.updatePermissions(spaceId, body)
  }
}
