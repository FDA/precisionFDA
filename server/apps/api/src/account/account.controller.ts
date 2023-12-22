import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { queue, UserContext } from '@shared'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/account')
export class AccountController {
  constructor(private readonly user: UserContext) {}

  @HttpCode(204)
  @Post('/checkSpacesPermissions')
  async checkSpacesPermissions() {
    return await queue.createSyncSpacesPermissionsTask(this.user)
  }

  @Get('/checkup')
  async userCheckup() {
    return await queue.createUserCheckupTask({
      type: queue.types.TASK_TYPE.USER_CHECKUP,
      user: this.user,
    })
  }
}
