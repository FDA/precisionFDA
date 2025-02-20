import { UserOpsCtx } from '@shared/types'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import {
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import {
  nodeCopyTemplate,
  NodeCopyTemplateInput,
} from '@shared/domain/email/templates/mjml/node-copy.template'
import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'

/**
 * Notifies users if some items weren't copied.
 */
export class NodeCopyHandler
  extends BaseTemplate<NodeCopyInputDTO, UserOpsCtx>
  implements EmailTemplate<NodeCopyTemplateInput>
{
  templateFile = nodeCopyTemplate
  nodeCopyInput: NodeCopyInputDTO = this.validatedInput

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'node_copy'
  }

  async setupContext(): Promise<void> {}

  async determineReceivers(): Promise<User[]> {
    return await this.ctx.em.find(User, {
      id: { $in: this.receiverUserIds },
    })
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const subject = `Some items haven\'t been copied to ${this.nodeCopyInput.destination}`
    const body = buildEmailTemplate<NodeCopyTemplateInput>(this.templateFile, {
      subject,
      destination: this.nodeCopyInput.destination,
      notCopiedFolderNames: this.nodeCopyInput.notCopiedFolderNames,
      notCopiedFileNames: this.nodeCopyInput.notCopiedFileNames,
      receiver,
    })
    return {
      emailType: EMAIL_TYPES.nodeCopy,
      to: receiver.email,
      body,
      subject,
    }
  }
}
