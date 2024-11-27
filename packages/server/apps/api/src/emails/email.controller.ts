import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { EmailFacade } from '@shared/domain/email/email.facade'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'

@UseGuards(InternalRouteGuard, UserContextGuard)
@Controller('/emails')
export class EmailController {
  constructor(private readonly emailFacade: EmailFacade) {}

  @HttpCode(200)
  @Post('/typed')
  async sendTypedEmail(@Body() body: TypedEmailBodyDto<EMAIL_TYPES>) {
    await this.emailFacade.sendEmail({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId: body.type,
    })
  }
}
