import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type LicenseRequestApprovedTemplateInput = {
  firstName: string
  lastName: string
  licenseTitle: string
  licenseUrl: string
  itemsLicenseUrl: string
}

export const licenseRequestApprovedTemplate = (data: LicenseRequestApprovedTemplateInput): string => `
  ${header}

    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          License request approved for ${data.licenseTitle}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">License Request Approved</mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          Dear ${data.firstName} ${data.lastName},
        </mj-text>

        <mj-text>
          We are happy to inform you that the license request for <strong><a href="${data.licenseUrl}">${data.licenseTitle}</a></strong> has been approved.
        </mj-text>

        <mj-text>
          You may now <a href="${data.itemsLicenseUrl}">use or download items</a> associated with this license.
        </mj-text>

        <mj-button href="${data.itemsLicenseUrl}" background-color="#1F70B5" color="white">
          View Licensed Items
        </mj-button>
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`
