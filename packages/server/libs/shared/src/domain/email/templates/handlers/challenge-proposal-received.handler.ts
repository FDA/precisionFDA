import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal.dto'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailAddress } from '@shared/domain/email/model/email-address'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { challengeProposalTemplate } from '@shared/domain/email/templates/mjml/challenge-proposed.template'
import { EmailClient } from '@shared/services/email-client'

@Injectable()
export class ChallengeProposalReceivedHandler extends EmailHandler<EMAIL_TYPES.challengeProposalReceived> {
  protected emailType = EMAIL_TYPES.challengeProposalReceived as const
  protected inputDto = ChallengeProposalInputDTO
  protected getBody = challengeProposalTemplate

  constructor(protected readonly emailClient: EmailClient) {
    super(emailClient)
  }

  protected async determineReceivers(): Promise<EmailAddress[]> {
    return config.challengeProposalRecipients
  }

  protected getTemplateInput(
    input: ChallengeProposalInputDTO,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.challengeProposalReceived] {
    return {
      content: {
        subject: 'New challenge proposal received',
        proposal: {
          name: input.name,
          email: input.email,
          organisation: input.organisation,
          specificQuestion: input.specific_question,
          specificQuestionText: input.specific_question_text,
          dataDetails: input.data_details,
          dataDetailsText: input.data_details_text,
        },
      },
    }
  }

  protected getSubject(input: ChallengeProposalInputDTO): string {
    return `${config.env} New challenge proposal received from ${input.name} (${input.email})`
  }

  protected async getContextualData(
    input: ChallengeProposalInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.challengeProposalReceived]> {
    return input
  }
}
