import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { InternalRouteGuard } from '../internal/guard/internal.guard'

@UseGuards(InternalRouteGuard)
@Controller('/emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @HttpCode(200)
  @Post('/typed')
  async sendTypedEmail(@Body() body: TypedEmailBodyDto<EMAIL_TYPES>): Promise<void> {
    await this.emailService.sendEmail(body)
  }
}
