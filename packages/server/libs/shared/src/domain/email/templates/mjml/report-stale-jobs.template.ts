import { JobStaleCheckDTO } from '@shared/domain/job/dto/job-stale-check.dto'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { footer, header } from './common'

export type ReportStaleJobsTemplateInput = {
  content: {
    jobsInfo: JobStaleCheckDTO[]
    maxDuration: string
  }
}

const renderJobsTable = (jobsInfo: SimpleJobDTO[]): string => {
  return `
  <mj-table>
    <tr style="border-bottom:1px solid #ecedee; text-align: left;">
      <th>Uid</th>
      <th>Name</th>
      <th>State</th>
      <th>Duration</th>
    </tr>
    ${jobsInfo.map(
      (job) => `<tr>
      <td>${job.uid}</td>
      <td><a href="${job.link}" target="_blank" style="color: #1f70b7; text-decoration: none;">${job.name}</a></td>
      <td>${job.state}</td>
      <td>${job.duration}</td>
    </tr>`,
    )}
  </mj-table>
  `
}

/**
 * This was meant to be an email for admins. Not used at the moment
 */
export const reportStaleJobsTemplate = (data: ReportStaleJobsTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          Report: Stale Jobs</mj-text>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        ${data.content.jobsInfo.map(
          (userJobs) => `
          <mj-text font-size="16px" font-weight="bold" padding-bottom="8px">
            User: ${userJobs.user.fullName} (${userJobs.user.dxuser})
          </mj-text>
          <mj-text font-weight="bold" font-size="14px">Stale Jobs</mj-text>
          ${
            userJobs.staleJobs.length === 0
              ? '<mj-text color="#666" align="center">No stale jobs found</mj-text>'
              : renderJobsTable(userJobs.staleJobs)
          }
          ${
            userJobs.nonStaleJobs.length === 0
              ? ''
              : `
            <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
            <mj-text font-weight="bold" font-size="14px">Non-stale Jobs</mj-text>
            ${renderJobsTable(userJobs.nonStaleJobs)}
          `
          }
          <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
          `,
        )}
        <mj-text>Jobs are stale after ${parseInt(data.content.maxDuration) / (60 * 60 * 24)} days</mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
