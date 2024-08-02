import { Controller, Get, UseGuards } from '@nestjs/common'
import { UserService } from '@shared/domain/user/user.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('/active')
  async listActiveUserNames() {
    return await this.userService.listActiveUserNames()
  }

  @Get('/government')
  async listGovernmentUserNames() {
    return await this.userService.listGovernmentUserNames()
  }
}
