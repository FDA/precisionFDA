import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getMiddleSpacer } from './common'

export type SpaceActivationTemplateInput = EmailTemplateInput & {
  spaceTitle: string
  activationRequestLead: string
  spaceUrl: string
  isReviewSpace: boolean
  leadsNames: string
}

export const spaceActivationTemplate = (data: SpaceActivationTemplateInput): string => `
  ${header}

    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          Space activation request for ${data.spaceTitle} as ${data.activationRequestLead}
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">Space Activation Request</mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          The space <strong><a href="${data.spaceUrl}">${data.spaceTitle}</a></strong> was provisioned and listed you as ${data.activationRequestLead}.
        </mj-text>

        <mj-text>
          To start adding data to this space, both ${data.isReviewSpace ? 'reviewer and sponsor' : data.leadsNames} lead admin(s) must accept the invitation. Please visit the space and click on "Accept space".
        </mj-text>

        <mj-button href="${data.spaceUrl}" background-color="#1F70B5" color="white">
          View Space Invitation
        </mj-button>
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`
