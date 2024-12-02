import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer, getExpertCtoButton } from './common'

export type ExpertAddedTemplateInput = EmailTemplateInput & {
  content: {
    expertName: string
    expertId: number
  }
}

export const expertAddedTemplate = (data: ExpertAddedTemplateInput): string => `
  ${header}
    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          New Expert Q&A Session for ${data.content.expertName}
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
          A new Expert Q&A Session has been created featuring ${data.content.expertName}.
        </mj-text>
        <mj-text>
          The Expert Q&A Session is only visible to the PrecisionFDA community and the general public when it is in the "public" state. Please coordinate with the PrecisionFDA admin when you are ready to make it public.
        </mj-text>
        <mj-text>
          At any time, you can open the Expert Q&A Session to accept question submissions by visiting the Expert Dashboard page, clicking the status drop-down button, and selecting "Open." Please note that if an Expert Q&A Session is open, it still needs to be made "public" before anyone else can see it and submit questions.
        </mj-text>
        <mj-text>
          To view and edit the details of your Expert Q&A session, please visit your Expert Dashboard.
        </mj-text>
        ${getExpertCtoButton(data.content.expertId)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>

    ${footer}
`
