import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type ChallengeProposalTemplateInput = {
  content: {
    subject: string
    proposal: {
      name: string
      email: string
      organisation: string
      specificQuestion: boolean
      specificQuestionText?: string
      dataDetails: boolean
      dataDetailsText?: string
    }
  }
}

const field = (label: string, value: string, isLast = false): string => `
  <mj-text padding-bottom="${isLast ? '0' : '14px'}">
    <div style="${isLast ? '' : 'border-bottom: 1px solid #edf2f7; padding-bottom: 14px;'}">
      <div style="font-size: 12px; line-height: 1.4; text-transform: uppercase; letter-spacing: 0.5px; color: #7a8aa0; padding-bottom: 3px;">
        ${label}
      </div>
      <div style="font-size: 16px; line-height: 1.5; color: #0a0a0a;">
        ${value}
      </div>
    </div>
  </mj-text>
`

export const challengeProposalTemplate = (data: ChallengeProposalTemplateInput): string => {
  const { proposal } = data.content

  return `
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
        <mj-text font-size="20px" font-weight="600" line-height="1.4" color="#0a0a0a" padding-bottom="4px">
          New challenge proposal received
        </mj-text>
        <mj-text font-size="15px" line-height="1.5" color="#5a6b7b" padding-bottom="20px">
          A new challenge proposal has been submitted. The details provided are below.
        </mj-text>

        ${field('Name', proposal.name)}
        ${field('Contact Email', `<a href="mailto:${proposal.email}">${proposal.email}</a>`)}
        ${field('Organisation / Institute', proposal.organisation)}
        ${field('Specific scientific question driving the challenge?', proposal.specificQuestion ? 'Yes' : 'No')}
        ${proposal.specificQuestion ? field('Scientific question details', proposal.specificQuestionText ?? '—') : ''}
        ${field('Access to data for the challenge?', proposal.dataDetails ? 'Yes' : 'No', !proposal.dataDetails)}
        ${proposal.dataDetails ? field('Data details (type, sample number, etc.)', proposal.dataDetailsText ?? '—', true) : ''}
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}
  ${footer}
`
}
