import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type LicenseApprovalTemplateInput = EmailTemplateInput & {
  userFullName: string
  userUsername: string
  userOrgName: string
  licenseTitle: string
  licenseUrl: string
  requestUrl: string
  message: string
  userId: number
}

export const licenseApprovalRequestTemplate = (data: LicenseApprovalTemplateInput): string => `
  ${header}

  <mj-section css-class="hidden-email-preview">
    <mj-column>
      <mj-text>
        License approval request from ${data.userFullName} for ${data.licenseTitle}
      </mj-text>
    </mj-column>
  </mj-section>

  ${getMiddleSpacer()}

  <mj-section css-class="header">
    <mj-column>
      <mj-text align="right" css-class="header-title">
        License Approval Request
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section css-class="body-section radius">
    <mj-column>
      <mj-text>
        An approval has been requested for the license <strong><a href="${data.licenseUrl}">${data.licenseTitle}</a></strong>.
      </mj-text>

      <mj-blockquote>
        ${data.message}
        <mj-footer>
          Requested by <cite>${data.userFullName} (${data.userUsername})</cite>
          &middot; ${data.userOrgName}
        </mj-footer>
      </mj-blockquote>

      <mj-button href="${data.requestUrl}" background-color="#007bff" color="white">
        View Request
      </mj-button>
    </mj-column>
  </mj-section>

  ${getBottomSpacer()}

  ${footer}
`
