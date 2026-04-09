import { footer, generateExpertQuestionLink, getBottomSpacer, getMiddleSpacer, header } from './common'

export type ExpertQuestionTemplateInput = {
  content: {
    senderName: string
    questionBody: string
    expertId: number
    questionId: number
  }
}

export const expertQuestionAddedTemplate = (data: ExpertQuestionTemplateInput): string => `
  ${header}
    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          New question from ${data.content.senderName}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right">
          Expert Q&A Session Notification
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          A new question was asked in your Expert Q&A Session
        </mj-text>
        <mj-text>
          Submitted by: ${data.content.senderName}
        </mj-text>
        <mj-text>
          "${data.content.questionBody}"
        </mj-text>
        <a href="${generateExpertQuestionLink(data.content.expertId, data.content.questionId)}">
          View Question in Expert Dashboard
        </a>
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>

    ${footer}
`
