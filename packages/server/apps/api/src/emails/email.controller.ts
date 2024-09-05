import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { EmailProcessInput } from '@shared/domain/email/email.config'
import { sendEmailBodySchema, sendEmailParamSchema } from '@shared/domain/email/email.input'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { EmailFacade } from '@shared/domain/email/email.facade'

@UseGuards(UserContextGuard)
@Controller('/emails')
export class EmailController {
  constructor(private readonly emailFacade: EmailFacade) {}

  @HttpCode(200)
  @Post('/:emailId/send')
  async sendEmail(
    @Param(new JsonSchemaPipe(sendEmailParamSchema))
    params: { emailId: number },
    @Body(new JsonSchemaPipe(sendEmailBodySchema))
    body: Omit<EmailProcessInput, 'emailTypeId'>,
  ) {
    await this.emailFacade.sendEmail({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId: params.emailId,
    })
  }
}
