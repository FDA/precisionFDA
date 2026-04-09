import { Injectable } from '@nestjs/common'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { nodeCopyTemplate } from '@shared/domain/email/templates/mjml/node-copy.template'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'

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

  protected getSubject(input: NodeCopyInputDTO): string {
    return `Some items haven't been copied to ${input.destination}`
  }

  protected getTemplateInput(input: NodeCopyInputDTO): EmailTypeToTemplateInputMap[EMAIL_TYPES.nodeCopy] {
    const subject = this.getSubject(input)
    return {
      subject,
      destination: input.destination,
      notCopiedFolderNames: input.notCopiedFolderNames,
      notCopiedFileNames: input.notCopiedFileNames,
    }
  }

  protected async getContextualData(input: NodeCopyInputDTO): Promise<EmailTypeToContextMap[EMAIL_TYPES.nodeCopy]> {
    return input
  }
}
