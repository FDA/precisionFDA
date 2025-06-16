import { Controller, Get, UseGuards } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/session')
export class SessionController {
  @Get('/refresh')
  async refresh(): Promise<void> {
    // Nothing to do here, just refresh the session if called by authenticated user
  }
}
