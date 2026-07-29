import { Body, Controller, Get, Param, ParseArrayPipe, ParseIntPipe, Put, UseGuards } from '@nestjs/common'
import { UserBasicInfoDTO } from '@shared/domain/user/dto/user-basic-info.dto'
import { UserCloudResourcesDTO } from '@shared/domain/user/dto/user-cloud-resources.dto'
import { UserGetParamsDTO } from '@shared/domain/user/dto/user-get-params.dto'
import { HeaderItem } from '@shared/domain/user/header-item'
import { UserService } from '@shared/domain/user/service/user.service'
import { SpaceOrSiteAdminGuard } from '../admin/guards/space-or-site-admin.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

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

  @Put('/header-items')
  async updateHeaderItems(@Body(new ParseArrayPipe({ items: HeaderItem })) body: HeaderItem[]): Promise<void> {
    return await this.userService.updateHeaderItems(body)
  }

  @Get('me/cloud-resources')
  async getCloudResources(): Promise<UserCloudResourcesDTO> {
    return await this.userService.getCloudResources()
  }

  @Get('/username/:dxuser')
  async getUserByDxuser(@Param('dxuser') dxuser: string): Promise<UserBasicInfoDTO> {
    return await this.userService.getUserDetailsByDxuser(dxuser, false)
  }

  @Get('/:id')
  async getUserBasicInfo(@Param('id', ParseIntPipe) id: number): Promise<UserBasicInfoDTO> {
    return await this.userService.getUserDetailsById(id, false)
  }
}
