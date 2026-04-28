import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Put, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { OrgUsersListDTO } from '@shared/domain/profile/dto/org-users-list.dto'
import { ProfilePageDTO } from '@shared/domain/profile/dto/profile-page.dto'
import { ProfileViewDTO } from '@shared/domain/profile/dto/profile-view.dto'
import { UpdateOrganizationDTO } from '@shared/domain/profile/dto/update-organization.dto'
import { UpdateOrgUserActiveDTO } from '@shared/domain/profile/dto/update-org-user-active.dto'
import { UpdateProfileDTO } from '@shared/domain/profile/dto/update-profile.dto'
import { UpdateTimezoneDTO } from '@shared/domain/user/dto/update-timezone.dto'
import { OrgMemberActionFacade } from '@shared/facade/profile/org-member-action.facade'
import { ProfileReadFacade } from '@shared/facade/profile/profile-read.facade'
import { ProfileUpdateFacade } from '@shared/facade/profile/profile-update.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@ApiTags('Profile')
@UseGuards(UserContextGuard)
@Controller('/profile')
export class ProfileController {
  constructor(
    private readonly profileReadFacade: ProfileReadFacade,
    private readonly profileUpdateFacade: ProfileUpdateFacade,
    private readonly orgMemberActionFacade: OrgMemberActionFacade,
  ) {}

  @ApiOperation({ summary: 'Get profile page data' })
  @Get()
  async getProfile(): Promise<ProfilePageDTO> {
    return this.profileReadFacade.getProfilePage()
  }

  @ApiOperation({ summary: 'Update profile' })
  @HttpCode(200)
  @Put()
  async updateProfile(@Body() body: UpdateProfileDTO): Promise<ProfileViewDTO> {
    return this.profileUpdateFacade.updateProfile(body)
  }

  @ApiOperation({ summary: 'Get organization users' })
  @Get('/organization/users')
  async getOrganizationUsers(): Promise<OrgUsersListDTO> {
    return this.profileReadFacade.getOrganizationUsers()
  }

  @ApiOperation({ summary: 'Update organization name' })
  @HttpCode(200)
  @Put('/organization')
  async updateOrganization(@Body() body: UpdateOrganizationDTO): Promise<UpdateOrganizationDTO> {
    return this.profileUpdateFacade.updateOrganizationName(body.name)
  }

  @ApiOperation({ summary: 'Update organization member active state' })
  @HttpCode(204)
  @Patch('/organization/users/:userId')
  async deactivateOrgUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() _body: UpdateOrgUserActiveDTO,
  ): Promise<void> {
    await this.orgMemberActionFacade.deactivateOrgUser(userId)
  }

  @ApiOperation({ summary: 'Request removal of an organization member' })
  @HttpCode(204)
  @Delete('/organization/users/:userId')
  async removeOrgMember(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    await this.orgMemberActionFacade.removeOrgMember(userId)
  }

  @ApiOperation({ summary: 'Update time zone' })
  @HttpCode(204)
  @Put('/time-zone')
  async updateTimeZone(@Body() body: UpdateTimezoneDTO): Promise<void> {
    return this.profileUpdateFacade.updateTimeZone(body.timeZone)
  }
}
