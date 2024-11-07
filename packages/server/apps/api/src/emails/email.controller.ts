import { Body, Controller, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { EmailFacade } from '@shared/domain/email/email.facade'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'

@UseGuards(UserContextGuard)
@Controller('/emails')
export class EmailController {
  constructor(private readonly emailFacade: EmailFacade) {}

  @HttpCode(200)
  @Post('/:emailTypeId/send')
  async sendTypedEmail(
    @Param('emailTypeId', ParseIntPipe) emailTypeId: number,
    @Body() body: TypedEmailBodyDto,
  ) {
    await this.emailFacade.sendEmail({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId,
    })
  }
}
