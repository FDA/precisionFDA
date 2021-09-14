import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

export type ReportStaleJobsTemplateInput = EmailTemplateInput & {
  content: {
    jobIds: number[]
    maxDuration: string
  }
}

/**
 * This was meant to be an email for admins. Not used at the moment
 */
export const reportStaleJobsTemplate = (data: ReportStaleJobsTemplateInput): string => `
  ${header}
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>Report: stale jobs (running longer than ${data.content.maxDuration})</mj-text>
        <mj-text>
        <ul>
          ${data.content.jobIds.map(jobId => `<li>Job id: ${jobId}</li>`)}
        </ul>
        </mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
