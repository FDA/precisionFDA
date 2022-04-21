import { EmailTemplateInput } from '../../email.config'
import { header, footer } from './common'

interface ReportDbClusterInfo {
  uid: string,
  name: string,
  dxuser: string,
  status: string,
  dxInstanceClass: string,
  duration: string,
}

export type ReportNonTerminatedDbClustersTemplateInput = EmailTemplateInput & {
  content: {
    nonTerminatedDbClusters: ReportDbClusterInfo[]
  }
}

const createDbClustersTable = (dbclustersInfo: ReportDbClusterInfo[]) => {
  return `
  <mj-table>
    <tr style="border-bottom:1px solid #ecedee; text-align: left;">
      <th>Uid</th>
      <th>Name</th>
      <th>User</th>
      <th>State</th>
      <th>Instance</th>
      <th>Duration</th>
    </tr>
    ${dbclustersInfo.map(dbcluster => `<tr>
      <td>${dbcluster.uid}</td>
      <td>${dbcluster.name}</td>
      <td>${dbcluster.dxuser}</td>
      <td>${dbcluster.status}</td>
      <td>${dbcluster.dxInstanceClass}</td>
      <td>${dbcluster.duration}</td>
    </tr>`
    ).join('\n')}
  </mj-table>
  `
}

/**
 * This was meant to be an email for admins. Not used at the moment
 */
export const reportNonTerminatedDbClustersTemplate = (data: ReportNonTerminatedDbClustersTemplateInput): string => `
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
        <mj-text font-weight="bold">Unterminated database </mj-text>
        ${(data.content.nonTerminatedDbClusters.length === 0) ?
          '<mj-text color="#666" align="center">No unterminated database clusters found</mj-text>' :
          createDbClustersTable(data.content.nonTerminatedDbClusters)}
      </mj-column>
    </mj-section>
  ${footer}
`
