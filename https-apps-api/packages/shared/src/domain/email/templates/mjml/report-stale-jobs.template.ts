import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'


export type ReportStaleJobsTemplateInput = EmailTemplateInput & {
  content: {
    jobInfos: {
      uid: string,
      name: string,
      dxuser: string,
      duration: string,
    }[]
    maxDuration: string
  }
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
        <mj-table>
          <tr style="border-bottom:1px solid #ecedee; text-align: left;">
            <th>Uid</th>
            <th>Name</th>
            <th>Dxuser</th>
            <th>Duration</th>
          </tr>
          ${data.content.jobInfos.map(jobInfo => ((
          `<tr>
            <td>${jobInfo.uid}</td>
            <td>${jobInfo.name}</td>
            <td>${jobInfo.dxuser}</td>
            <td>${jobInfo.duration}</td>
          </tr>`
          )))}
        </mj-table>
        <mj-text>Max duration: ${data.content.maxDuration}</mj-text>
      </mj-column>
    </mj-section>
  ${footer}
`
