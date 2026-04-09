import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { getPluralizedTerm } from '@shared/utils/format'
import { footer, header } from './common'

export type ReportRunningJobsTemplateInput = {
  content: {
    runningJobs: SimpleJobDTO[]
    jobOwner: SimpleUserDTO
  }
}

const createJobsList = (jobsInfo: SimpleJobDTO[]): string => {
  return jobsInfo
    .map(
      job => `
      <mj-text padding-bottom="16px">
        <div style="border-left: 3px solid #1f70b7; padding-left: 12px; margin-bottom: 12px;">
          <div style="margin-bottom: 4px;">
            <strong><a href="${job.link}" target="_blank" style="color: #1f70b7; text-decoration: none;">${job.name}</a></strong>
          </div>
          <table style="font-size: 13px; color: #62676a; line-height: 1.6; width: 100%;">
            <tr><td style="padding: 2px 0;"><strong>UID:</strong></td><td style="padding: 2px 0;">${job.uid}</td></tr>
            <tr><td style="padding: 2px 0;"><strong>State:</strong></td><td style="padding: 2px 0;">${job.state}</td></tr>
            <tr><td style="padding: 2px 0;"><strong>Duration:</strong></td><td style="padding: 2px 0;">${job.duration}</td></tr>
          </table>
        </div>
      </mj-text>
    `,
    )
    .join('')
}

export const reportRunningJobsTemplate = (data: ReportRunningJobsTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Report: Active Jobs
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text>Hello ${data.content.jobOwner.firstName}!</mj-text>
        <mj-text>
          You currently have active job(s) running. Please review and stop any that are no longer needed to avoid unnecessary costs.
        </mj-text>
        <mj-text font-size="14px" color="#62676a">
          <p><strong>Total:</strong> ${getPluralizedTerm(data.content.runningJobs.length, 'job')}</p>
        </mj-text>
        ${createJobsList(data.content.runningJobs)}
      </mj-column>
    </mj-section>
  ${footer}
`
