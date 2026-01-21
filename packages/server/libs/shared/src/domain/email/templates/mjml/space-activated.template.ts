import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type SpaceActivatedTemplateInput = {
  firstName: string
  lastName: string
  spaceTitle: string
  spaceUrl: string
}

export const spaceActivatedTemplate = (data: SpaceActivatedTemplateInput): string => `
  ${header}

    <mj-section css-class="hidden-email-preview">
      <mj-column>
        <mj-text>
          Start by sharing data and adding members to this space
        </mj-text>
      </mj-column>
    </mj-section>

    ${getMiddleSpacer()}

    <mj-section css-class="header">
      <mj-column>
        <mj-text align="right" css-class="header-title">Space Activated</mj-text>
      </mj-column>
    </mj-section>

    <mj-section css-class="body-section radius">
      <mj-column>
        <mj-text>
          Dear ${data.firstName} ${data.lastName},
        </mj-text>

        <mj-text>
          The space <strong><a href="${data.spaceUrl}">${data.spaceTitle}</a></strong> has been activated, and you can now start sharing data with members of the space.
        </mj-text>

        <mj-button href="${data.spaceUrl}" background-color="#1F70B5" color="white">
          View Space
        </mj-button>
      </mj-column>
    </mj-section>

    ${getBottomSpacer()}

  ${footer}
`
