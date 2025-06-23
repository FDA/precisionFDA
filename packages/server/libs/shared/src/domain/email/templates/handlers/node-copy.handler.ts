import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { nodeCopyTemplate } from '@shared/domain/email/templates/mjml/node-copy.template'
import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'

/**
 * Notifies users if some items weren't copied.
 */
@Injectable()
export class NodeCopyHandler extends EmailHandler<EMAIL_TYPES.nodeCopy> {
  protected emailType = EMAIL_TYPES.nodeCopy as const
  protected inputDto = NodeCopyInputDTO
  protected getBody = nodeCopyTemplate

  constructor(
    protected readonly userRepo: UserRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async determineReceivers(input: NodeCopyInputDTO): Promise<User[]> {
    return await this.userRepo.find({
      id: { $in: input.receiverUserIds },
    })
  }

  protected getSubject(_receiver: User, input: NodeCopyInputDTO): string {
    return `Some items haven't been copied to ${input.destination}`
  }

  protected getTemplateInput(
    receiver: User,
    input: NodeCopyInputDTO,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.nodeCopy] {
    const subject = this.getSubject(receiver, input)
    return {
      subject,
      destination: input.destination,
      notCopiedFolderNames: input.notCopiedFolderNames,
      notCopiedFileNames: input.notCopiedFileNames,
      receiver,
    }
  }

  protected async getContextualData(
    input: NodeCopyInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.nodeCopy]> {
    return input
  }
}
