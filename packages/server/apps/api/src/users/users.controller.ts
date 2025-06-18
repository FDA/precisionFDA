import { Body, Controller, Get, ParseArrayPipe, Put, UseGuards } from '@nestjs/common'
import { UserService } from '@shared/domain/user/user.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { HeaderItem } from '@shared/domain/user/header-item'

@UseGuards(UserContextGuard)
@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/active')
  async listActiveUserNames() {
    return await this.userService.listActiveUserNames()
  }

  @Get('/government')
  async listGovernmentUserNames() {
    return await this.userService.listGovernmentUserNames()
  }

  @Get('/header-items')
  async listHeaderItems() {
    return await this.userService.listHeaderItems()
  }

  @Put('/header-items')
  async updateHeaderItems(@Body(new ParseArrayPipe({ items: HeaderItem })) body: HeaderItem[]) {
    return await this.userService.updateHeaderItems(body)
  }

  @Get('me/cloud-resources')
  async getCloudResources() {
    return await this.userService.getCloudResources()
  }
}
