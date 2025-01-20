import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type LicenseRevokedTemplateInput = EmailTemplateInput & {
  firstName: string
  lastName: string
  licenseTitle: string
  licenseUrl: string
}

export const licenseRevokedTemplate = (data: LicenseRevokedTemplateInput): string => `
  ${header}

    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          License revoked for ${data.licenseTitle}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">License Revoked</mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          Dear ${data.firstName} ${data.lastName},
        </mj-text>

        <mj-text>
          We regret to inform you that your license for <strong><a href="${data.licenseUrl}">${data.licenseTitle}</a></strong> has been revoked by the license administrator.
        </mj-text>

        <mj-text>
          If you would like to request access to this license again, please follow the instructions on the license page.
        </mj-text>
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`
