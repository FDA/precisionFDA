import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type ChallengeProposalTemplateInput = {
  content: {
    subject: string
    proposal: {
      name: string
      email: string
      organisation: string
      specificQuestion: string
      specificQuestionText?: string
      dataDetails: string
      dataDetailsText?: string
    }
  }
}

export const challengeProposalTemplate = (data: ChallengeProposalTemplateInput): string => `
  ${header}
    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          ${data.content.subject}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right">
          New challenge proposal
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          ${data.content.subject}
        </mj-text>
        <mj-text>
          <em>Name:</em> ${data.content.proposal.name}
        </mj-text>
        <mj-text>
          <em>Contact Email:</em> ${data.content.proposal.email}
        </mj-text>
        <mj-text>
          <em>Organisation/Institute:</em> ${data.content.proposal.organisation}
        </mj-text>
        <mj-text>
          <em>Do you have specific scientific question driving the challenge?</em> ${data.content.proposal.specificQuestion}
        </mj-text>
        ${
          data.content.proposal.specificQuestion
            ? `
          <mj-text>
            <em>Please provide details:</em> ${data.content.proposal.specificQuestionText}
          </mj-text>`
            : ''
        }
        <mj-text>
          <em>Do you have access to data for the challenge?</em> ${data.content.proposal.dataDetails}
        </mj-text>
        ${
          data.content.proposal.dataDetails
            ? `
          <mj-text>
            <em>Please provide details about the data (e.g. data type, sample number, etc):</em> ${data.content.proposal.dataDetailsText}
          </mj-text>`
            : ''
        }
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}
  ${footer}
`
