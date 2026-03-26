import { AdminDataConsistencyReportOutput } from '@shared/debug/admin-data-consistency-report.service'
import { footer, header } from './common'

export type AdminDataConsistencyReportTemplateInput = {
  content: AdminDataConsistencyReportOutput
}

const createSection = (title: string, count: number | undefined, content: unknown[]) => {
  return `
    <mj-column width="100%">
      <mj-raw>
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif">
          <h4 style="font-size: 16px">${title}</h4>
          ${
            count === 0
              ? `<p style="color: #666; align: center;">No ${title} found</p>`
              : `<div style="width: 100%; overflow: auto; border: 1px solid #ccc; font-size: 14px; padding: 8px; box-sizing: border-box">
                  <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(content, undefined, 2)}</pre>
                </div>`
          }
        </div>
      </mj-raw>
      <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
    </mj-column>
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
    <mj-section css-class="body-section">
      ${createSection('pFDA-Only Folders', data.content.pfdaOnlyFoldersCount, data.content.pfdaOnlyFolders)}
      ${createSection('Folders with Inconsistent Parent', data.content.foldersWithParentCount, data.content.foldersWithParent)}
      ${createSection('Unclosed Files', data.content.unclosedFilesCount, data.content.unclosedFiles)}
      ${createSection('Running Jobs', data.content.runningJobsCount, data.content.runningJobs)}
      ${createSection('Spaces with errors', data.content.spacesWithErrorsCount, data.content.spaces)}
    </mj-section>
  ${footer}
`
