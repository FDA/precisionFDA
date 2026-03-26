import { UserDataConsistencyReportOutput } from '@shared/facade/user/user-facade.types'
import { footer, header } from './common'

export type UserDataConsistencyReportTemplateInput = {
  content: UserDataConsistencyReportOutput
}

const createSection = (title: string, count: number | undefined, content: object) => {
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
export const userDataConsistencyReportTemplate = (
  data: UserDataConsistencyReportTemplateInput,
): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">User Data Consistency Report</mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column>
        <mj-text font-weight="bold">User</mj-text>
        <mj-text color="#666" align="center">${data.content.user?.dxuser}</mj-text>
        <mj-text color="#666" align="center">${data.content.user?.email}</mj-text>
        <mj-divider border-width="1px" border-color="lightgrey" padding-top="24px" padding-bottom="24px" />
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      ${createSection('Billable org', data.content.billableOrgErrorsCount, data.content.billableOrg)}
      ${createSection('Private Projects', data.content.privateProjectsCount, data.content.privateProjects)}
      ${createSection('Files and Folders Errors', data.content.filesAndFoldersErrorsCount, data.content.filesAndFoldersStatus)}
      ${createSection('Unclosed Files', data.content.unclosedFilesCount, data.content.unclosedFiles)}
      ${createSection('Spaces where user is lead', data.content.spacesWithErrorsCount, data.content.spaces)}
    </mj-section>
  ${footer}
`
