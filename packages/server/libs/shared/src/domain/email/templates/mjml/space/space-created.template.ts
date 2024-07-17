import { EmailTemplateInput } from '@shared/domain/email/email.config'
import { header, footer, getBottomSpacer, getViewSpaceButton, generateSpaceLink } from './../common'

export type SpaceCreatedTemplateInput = EmailTemplateInput & {
  space: { name: string; id: number }
}

export const spaceCreatedTemplate = (data: SpaceCreatedTemplateInput): string => `
  ${header}
    <mj-section css-class="header-title">
      <mj-column>
        <mj-text align="right">
          SPACE CREATED
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section css-class="body-section">
      <mj-column width="100%">
        <mj-text>
          Hello ${data.receiver.firstName}!
        </mj-text>
        <mj-text>
          The space <a href="${generateSpaceLink(data.space.id)}"> ${data.space.name}</a> has been created.
          You may now add or transfer data to share with other members of this Space.
        </mj-text>
  ${getViewSpaceButton(data.space.id)}
        ${getBottomSpacer()}
      </mj-column>
    </mj-section>
  ${footer}
`
