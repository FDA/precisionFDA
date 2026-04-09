import { footer, getBottomSpacer, getMiddleSpacer, header } from './common'

export type SpaceInvitationTemplateInput = {
  spaceTitle: string
  adminFullName: string
  membershipRoleAlias: string
  membershipSideAlias: string
  spaceUrl: string
  adminUserUrl: string
}

export const spaceInvitationTemplate = (data: SpaceInvitationTemplateInput): string => `
  ${header}

  <!-- Hidden email preview text -->
  <mj-section css-class="hidden-email-preview">
    <mj-column>
      <mj-text>
        Start by collaborating and sharing data to this space
      </mj-text>
    </mj-column>
  </mj-section>

  ${getMiddleSpacer()}

  <!-- Email Header -->
  <mj-section css-class="header">
    <mj-column>
      <mj-text align="right" css-class="header-title">Added to Space</mj-text>
    </mj-column>
  </mj-section>

  <!-- Body Section - Space Information -->
  <mj-section css-class="body-section radius">
    <mj-column>
      <mj-text>
        You were added to the space <strong><a href="${data.spaceUrl}">${data.spaceTitle}</a></strong> by <a href="${data.adminUserUrl}">${data.adminFullName}</a>.
      </mj-text>

      <mj-text>
        Role: <strong>${data.membershipRoleAlias}</strong>
      </mj-text>

      <mj-text>
        Side: <strong>${data.membershipSideAlias}</strong>
      </mj-text>

      <mj-text>
        Spaces let you move data from your private area and share it with space members to access. You can then publish the data out of the space to the precisionFDA community.
      </mj-text>

      <mj-button href="${data.spaceUrl}" background-color="#1F70B5" color="white">
        View Space
      </mj-button>
    </mj-column>
  </mj-section>

  ${getBottomSpacer()}

  ${footer}
`
