import { Body, Controller, HttpCode, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common'
import { UpdateSpaceMembershipDTO } from '@shared/domain/space-membership/dto/update-space-membership.dto'
import { SpaceMembershipUpdateApiFacade } from '../facade/space-membership/space-membership-update-api.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { ApiOperation } from '@nestjs/swagger'

@UseGuards(UserContextGuard)
@Controller('/spaces/:spaceId/memberships')
export class SpaceMembershipsController {
  constructor(private readonly spaceMembershipUpdateApiFacade: SpaceMembershipUpdateApiFacade) {}

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
