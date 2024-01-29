import { TASK_TYPE } from '@shared/queue/task.input'
import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { createSyncSpacesPermissionsTask, createUserCheckupTask } from '@shared/queue'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/account')
export class AccountController {
  constructor(private readonly user: UserContext) {}

  @HttpCode(204)
  @Post('/checkSpacesPermissions')
  async checkSpacesPermissions() {
    return await createSyncSpacesPermissionsTask(this.user)
  }

  @Get('/checkup')
  async userCheckup() {
    return await createUserCheckupTask({
      type: TASK_TYPE.USER_CHECKUP,
      user: this.user,
    })
  }
}
