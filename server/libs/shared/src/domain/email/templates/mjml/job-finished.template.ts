/* eslint-disable max-len */
import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateJobDetailLink, getMiddleSpacer } from './common'

export type JobFinishedInputTemplate = EmailTemplateInput & {
  content: {
    job: {
      id: number
      uid: string
      name: string
    }
  }
}

export const jobFinishedTemplate = (data: JobFinishedInputTemplate): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Execution finished
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          An execution on precisionFDA has finished successfully.
          The execution page can be viewed here: <a href="${generateJobDetailLink(
            data.content.job.uid,
          )}">${data.content.job.name}</a>
        </mj-text>
        ${getMiddleSpacer()}
        <mj-text>
          If you do not want to receive further emails about execution completion on precisionFDA, you can opt out of these emails by logging in and going to "Notification Settings" in the dropdown under your profile name.
        </mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
