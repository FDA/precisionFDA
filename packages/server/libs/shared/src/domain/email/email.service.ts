import { Inject, Injectable } from '@nestjs/common'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { TYPE_TO_HANDLER_PROVIDER_MAP } from '@shared/domain/email/type-to-handler-map.provider'

@Injectable()
export class EmailService {
  constructor(
    @Inject(TYPE_TO_HANDLER_PROVIDER_MAP)
    private readonly typeToHandlerMap: {
      [T in EMAIL_TYPES]: EmailHandler<T>
    },
  ) {}

  async sendEmail<T extends EMAIL_TYPES>(body: TypedEmailBodyDto<T>): Promise<void> {
    const handler = this.typeToHandlerMap[body.type]
    if (handler) {
      await handler.sendEmail(body.input)
    } else {
      throw new Error(`Handler for type ${body.type} not found`)
    }
  }
}
