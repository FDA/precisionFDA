import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { challengeProposalTemplate } from '@shared/domain/email/templates/mjml/challenge-proposed.template'
import { User } from '@shared/domain/user/user.entity'
import { config } from '@shared/config'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal.dto'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { EmailClient } from '@shared/services/email-client'
import { Injectable } from '@nestjs/common'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'
import { EmailTypeToContextMap } from '@shared/domain/email/dto/email-type-to-context.map'

@Injectable()
export class ChallengeProposalReceivedHandler extends EmailHandler<EMAIL_TYPES.challengeProposalReceived> {
  protected emailType = EMAIL_TYPES.challengeProposalReceived as const
  protected inputDto = ChallengeProposalInputDTO
  protected getBody = challengeProposalTemplate

  constructor(protected readonly emailClient: EmailClient) {
    super(emailClient)
  }

  protected async determineReceivers(): Promise<User[]> {
    return config.challengeProposalRecipients.map(
      (receiverEmail) => ({ email: receiverEmail }) as User,
    )
  }

  protected getTemplateInput(
    _receiver: User,
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

  protected getSubject(_receiver: User, input: ChallengeProposalInputDTO): string {
    return `${config.env} New challenge proposal received from ${input.name} (${input.email})`
  }

  protected async getContextualData(
    input: ChallengeProposalInputDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.challengeProposalReceived]> {
    return input
  }
}
