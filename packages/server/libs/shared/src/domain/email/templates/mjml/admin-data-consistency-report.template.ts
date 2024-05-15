import { AdminDataConsistencyReportOutput } from '@shared/debug/admin-data-consistency-report.service'
import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { footer, header } from './common'

export type AdminDataConsistencyReportTemplateInput = EmailTemplateInput & {
  content: AdminDataConsistencyReportOutput
}

const createSection = (title: string, count: number | undefined, content: any[]) => {
  return `
  <mj-section css-class="body-section">
    <mj-column>
      <mj-text font-weight="bold">${title}</mj-text>
      ${
        count === 0
          ? `<mj-text color="#666" align="center">No ${title} found</mj-text>`
          : `<mj-text><pre>${JSON.stringify(content, undefined, 2)}</pre></mj-text>`
      }
      <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
    </mj-column>
  </mj-section>
  `
}

/**
 * Report various data consistency
 */
export const adminDataConsistencyReportTemplate = (
  data: AdminDataConsistencyReportTemplateInput,
): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">Admin Data Consistency Report</mj-text>
        <mj-text font-weight="bold">HTTPS Files and Folders</mj-text>
      </mj-column>
    </mj-section>
    ${createSection('pFDA-Only Folders', data.content.pfdaOnlyFoldersCount, data.content.pfdaOnlyFolders)}
    ${createSection('Folders with Inconsistent Parent', data.content.foldersWithParentCount, data.content.foldersWithParent)}
    ${createSection('Unclosed Files', data.content.unclosedFilesCount, data.content.unclosedFiles)}
    ${createSection('Running Jobs', data.content.runningJobsCount, data.content.runningJobs)}
    ${createSection('Spaces with errors', data.content.spacesWithErrorsCount, data.content.spaces)}
  ${footer}
`
