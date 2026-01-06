import { Body, Controller, Get, ParseArrayPipe, Put, UseGuards } from '@nestjs/common'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { HeaderItem } from '@shared/domain/user/header-item'
import { UserCloudResourcesDTO } from '@shared/domain/user/dto/user-cloud-resources.dto'
import { SpaceOrSiteAdminGuard } from '../admin/guards/space-or-site-admin.guard'

@UseGuards(UserContextGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(SpaceOrSiteAdminGuard)
  @Get('/active')
  async listActiveUserNames(): Promise<string[]> {
    return await this.userService.listActiveUserNames()
  }

  @UseGuards(SpaceOrSiteAdminGuard)
  @Get('/government')
  async listGovernmentUserNames(): Promise<string[]> {
    return await this.userService.listGovernmentUserNames()
  }

  @Get('/header-items')
  async listHeaderItems(): Promise<HeaderItem[]> {
    return await this.userService.listHeaderItems()
  }

  @Put('/header-items')
  async updateHeaderItems(
    @Body(new ParseArrayPipe({ items: HeaderItem })) body: HeaderItem[],
  ): Promise<void> {
    return await this.userService.updateHeaderItems(body)
  }

  @Get('me/cloud-resources')
  async getCloudResources(): Promise<UserCloudResourcesDTO> {
    return await this.userService.getCloudResources()
  }
}
