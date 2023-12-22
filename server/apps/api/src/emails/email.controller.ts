import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Param, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, email, UserContext } from '@shared'
import { EmailProcessInput } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/emails')
export class EmailController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(200)
  @Post('/:emailId/send')
  async sendEmail(
    @Param(new JsonSchemaPipe(email.inputs.sendEmailParamSchema))
    params: { emailId: number },
    @Body(new JsonSchemaPipe(email.inputs.sendEmailBodySchema))
    body: Omit<EmailProcessInput, 'emailTypeId'>,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new email.EmailProcessOperation(opsCtx).execute({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId: params.emailId,
    })
  }
}
