import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer } from './common'
import { UserDataConsistencyReportOutput } from '@shared/domain/user/user-data-consistency-report.service'

export type UserDataConsistencyReportTemplateInput = EmailTemplateInput & {
  content: UserDataConsistencyReportOutput
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
    ${createSection('Private Projects', data.content.privateProjectsCount, data.content.privateProjects)}
    ${createSection('Files and Folders Errors', data.content.filesAndFoldersErrorsCount, data.content.filesAndFoldersStatus)}
    ${createSection('Unclosed Files', data.content.unclosedFilesCount, data.content.unclosedFiles)}
    ${createSection('Spaces where user is lead', data.content.spacesWithErrorsCount, data.content.spaces)}
  ${footer}
`
