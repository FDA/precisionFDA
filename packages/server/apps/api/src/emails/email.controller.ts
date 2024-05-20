import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Logger, Param, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { EmailProcessInput } from '@shared/domain/email/email.config'
import { sendEmailBodySchema, sendEmailParamSchema } from '@shared/domain/email/email.input'
import { EmailProcessOperation } from '@shared/domain/email/ops/email-process'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/emails')
export class EmailController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @HttpCode(200)
  @Post('/:emailId/send')
  async sendEmail(
    @Param(new JsonSchemaPipe(sendEmailParamSchema))
    params: { emailId: number },
    @Body(new JsonSchemaPipe(sendEmailBodySchema))
    body: Omit<EmailProcessInput, 'emailTypeId'>,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new EmailProcessOperation(opsCtx).execute({
      input: body.input,
      receiverUserIds: body.receiverUserIds,
      emailTypeId: params.emailId,
    })
  }
}
