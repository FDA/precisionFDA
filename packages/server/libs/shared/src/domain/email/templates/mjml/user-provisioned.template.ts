import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type UserProvisionedInput = EmailTemplateInput & {
  firstName: string
  username: string
  email: string
}

export const userProvisionedTemplate = (data: UserProvisionedInput): string => `
  ${header}
    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          Welcome to precisionFDA, ${data.firstName}!
        </mj-text>
      </mj-column>
    </mj-section>
    ${getMiddleSpacer()}
    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">Welcome to precisionFDA</mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          <h4 style="font-size:22px;font-weight:bold;margin-top:0;margin-bottom:10px;">Welcome to precisionFDA, ${data.firstName}!</h4>
        </mj-text>
        <mj-text>
          Your request to join the precisionFDA platform has been approved; you may now start exploring datasets and contributing workflows by using single sign-on (SSO) to access precisionFDA from your laptop.
        </mj-text>
        <mj-text>
          Your username for precisionFDA: <strong>${data.username}</strong>
        </mj-text>
        <mj-text>
          Your email address used for this account: <strong><a href="mailto:${data.email}" target="_blank">${data.email}</a></strong>
        </mj-text>
        <mj-text>
          <strong>What is precisionFDA?</strong><br />
          PrecisionFDA provides the genomics community with a secure, cloud-based platform where participants can access and share datasets, analysis pipelines, and bioinformatics tools, in order to benchmark their approaches and advance regulatory science.
        </mj-text>
        <mj-text>
          <strong><a href="https://precision.fda.gov/about" style="color:#2974a8;font-weight:bold;text-decoration:underline" target="_blank">Learn more</a></strong> about the precisionFDA initiative and platform.
        </mj-text>
      </mj-column>
    </mj-section>
    ${getBottomSpacer()}
  ${footer}
`
