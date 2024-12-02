import {
  ChallengeProposalInput,
  EMAIL_TYPES,
  EmailSendInput,
  EmailTemplate,
  NOTIFICATION_TYPES_BASE,
} from '@shared/domain/email/email.config'
import { BaseTemplate } from '@shared/domain/email/templates/base-template'
import { UserOpsCtx } from '@shared/types'
import {
  challengeProposalTemplate,
  ChallengeProposalTemplateInput,
} from '@shared/domain/email/templates/mjml/challenge-proposed.template'
import { User } from '@shared/domain/user/user.entity'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import process from 'process'
import { config } from '@shared/config'

export class ChallengeProposalReceivedHandler
  extends BaseTemplate<ChallengeProposalInput, UserOpsCtx>
  implements EmailTemplate<ChallengeProposalTemplateInput>
{
  input = this.validatedInput
  templateFile = challengeProposalTemplate

  async setupContext(): Promise<void> {}

  async determineReceivers(): Promise<User[]> {
    return config.challengeProposalRecipients.map(
      (receiverEmail) => ({ email: receiverEmail }) as User,
    )
  }

  async template(receiver: User): Promise<EmailSendInput> {
    const templateInput: ChallengeProposalTemplateInput = {
      content: {
        subject: 'New challenge proposal received',
        proposal: {
          name: this.input.name,
          email: this.input.email,
          organisation: this.input.organisation,
          specificQuestion: this.input.specific_question,
          specificQuestionText: this.input.specific_question_text,
          dataDetails: this.input.data_details,
          dataDetailsText: this.input.data_details_text,
        },
      },
    }

    const body = buildEmailTemplate<ChallengeProposalTemplateInput>(
      this.templateFile,
      templateInput,
    )
    return {
      emailType: EMAIL_TYPES.challengeProposalReceived,
      to: receiver.email,
      body,
      subject: `${process.env.NODE_ENV} New challenge proposal received from ${this.input.name} (${this.input.email})`,
    }
  }

  getNotificationKey(): keyof typeof NOTIFICATION_TYPES_BASE {
    return 'challenge_proposal_received'
  }
}
