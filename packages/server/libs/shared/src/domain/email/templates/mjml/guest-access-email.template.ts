import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type GuestAccessTemplateInput = {
  firstName: string
  lastName: string
}

export const guestAccessTemplate = (data: GuestAccessTemplateInput): string => `
  ${header}

    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          Invitation for Full Account Access on precisionFDA
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-text>
        Dear ${data.firstName} ${data.lastName},
      </mj-text>

      <mj-text>
        Thank you for your interest in the precisionFDA platform. Provisioning of your full account is pending; there is no further action needed from you at this time. You will soon receive a second email with a link to set up your password and multi-factor authentication.
      </mj-text>

      <mj-section css-class="note-section">
        <mj-text>
          Note: PrecisionFDA is a production regulatory research platform and is intended to inform a broad community. Your request for a full account is pending and will be provisioned by the administrators. This may take several days. If more than two weeks have elapsed and your full access account has not been provisioned, please contact PrecisionFDA@fda.hhs.gov.
        </mj-text>
      </mj-section>

      <mj-text>
        We are looking forward to seeing you online!
      </mj-text>

      <mj-text>
        &mdash;The precisionFDA team
      </mj-text>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`
