/* eslint-disable max-len */
import { EmailTemplateInput } from '../../email.config'
import { header, footer, generateJobDetailLink } from './common'

export type JobFailedInputTemplate = EmailTemplateInput & {
  content: {
    job: {
      id: number
      uid: string
      name: string
      failureReason: string
      failureMessage: string
      runTimeString?: string
    }
  }
}

export const jobFailedTemplate = (data: JobFailedInputTemplate): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Execution failed
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          An execution on precisionFDA has failed due to the following reason:
        </mj-text>
        <mj-text>
          ${data.content.job.failureReason}: ${data.content.job.failureMessage}
        </mj-text>
        <mj-text>
          The execution page can be viewed here: <a href="${generateJobDetailLink(data.content.job.uid)}">${data.content.job.name}</a>
        </mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`

export const jobCostLimitExceededTemplate = (data: JobFailedInputTemplate): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Execution failed
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          There was an error running execution ${data.content.job.uid}. The execution failed after
          ${data.content.job.runTimeString} due to a limit being reached for any single execution's
          compute cost consumption. Please email precisionfda-support@dnanexus.com if you wish to
          change your per-execution cost limit.
        </mj-text>
        <mj-text>
          The execution page can be viewed here: <a href="${generateJobDetailLink(data.content.job.uid)}">${data.content.job.name}</a>
        </mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
