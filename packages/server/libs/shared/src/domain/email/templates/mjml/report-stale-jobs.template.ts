import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer } from './common'


interface ReportJobInfo {
  uid: string,
  name: string,
  dxuser: string,
  state: string,
  duration: string,
}

export type ReportStaleJobsTemplateInput = EmailTemplateInput & {
  content: {
    staleJobsInfo: ReportJobInfo[]
    nonStaleJobsInfo: ReportJobInfo[]
    maxDuration: string
  }
}

const createJobsTable = (jobsInfo: ReportJobInfo[]) => {
  return `
  <mj-table>
    <tr style="border-bottom:1px solid #ecedee; text-align: left;">
      <th>Uid</th>
      <th>Name</th>
      <th>User</th>
      <th>State</th>
      <th>Duration</th>
    </tr>
    ${jobsInfo.map(job => `<tr>
      <td>${job.uid}</td>
      <td>${job.name}</td>
      <td>${job.dxuser}</td>
      <td>${job.state}</td>
      <td>${job.duration}</td>
    </tr>`
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
        <mj-text font-weight="bold">Stale Jobs</mj-text>
        ${(data.content.staleJobsInfo.length === 0) ?
          '<mj-text color="#666" align="center">No stale jobs found</mj-text>' :
          createJobsTable(data.content.staleJobsInfo)}
        <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
        <mj-text font-weight="bold">Other Jobs</mj-text>
        ${(data.content.nonStaleJobsInfo.length === 0) ?
          '<mj-text color="#666" align="center">No running jobs found</mj-text>' :
          createJobsTable(data.content.nonStaleJobsInfo)}
        <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
        <mj-text>Jobs are stale after ${parseInt(data.content.maxDuration) / (60*60*24)} days</mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
